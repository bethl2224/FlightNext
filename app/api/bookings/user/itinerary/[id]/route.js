import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
// Helper function to calculate the number of nights
const calculateNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};
export async function GET(req, { params }) {
  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    // Check if the id is an integer
    if (isNaN(id) || !Number.isInteger(parseFloat(id))) {
      return NextResponse.json(
        { error: "Invalid itinerary ID" },
        { status: 400 }
      );
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: parseInt(id) },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the user
    if (itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to itinerary" },
        { status: 403 }
      );
    }

    // Calculate flight price (each flight is $100)
    const flightPrice = itinerary.flights.length * 100;

    // Calculate hotel price and fetch room types
    let hotelPrice = 0;
    const hotelRoomTypes = [];
    for (const hotel of itinerary.hotelBookings) {
      // Fetch all room types for the hotel
      const roomTypes = await prisma.hotelRoomType.findMany({
        where: {
          hotelId: hotel.hotelId,
        },
      });

      // Add the room types to the response
      hotelRoomTypes.push({
        hotelId: hotel.hotelId,
        roomTypes,
      });

      // Find the specific room type for the booking
      const bookedRoomType = roomTypes.find(
        (room) => room.roomType === hotel.roomType
      );


      const nights = calculateNights(hotel.checkInDate, hotel.checkOutDate); 

      if (bookedRoomType) {
        hotelPrice += nights * bookedRoomType.pricePerNight;
      }
    }

    // Calculate subtotal, taxes, and total
    const subtotal = flightPrice + hotelPrice;
    const taxesAndFees = Math.round(subtotal * 0.1); // Example: 10% taxes
    const total = subtotal + taxesAndFees;

    // Add price breakdown and room types to the response
    const response = {
      ...itinerary,
      priceBreakdown: {
        flightPrice,
        hotelPrice,
        subtotal,
        taxesAndFees,
        total,
      },
      hotelRoomTypes, // Include all room types for the hotels
    };
    console.log("here***********************888")
    console.log("Response:", JSON.stringify(response));
    console.log("Itinerary Data:", JSON.stringify(itinerary));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }


    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    // Check if the id is an integer
    if (isNaN(id) || !Number.isInteger(parseFloat(id))) {
      return NextResponse.json(
        { error: "Invalid itinerary ID" },
        { status: 400 }
      );
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: parseInt(id) },
      include: {
        flights: true
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the user
    if (itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to itinerary" },
        { status: 403 }
      );
    }

    // Delete the related flights in the AFS system
    for (const flight of itinerary.flights) {
      // Delete the flight
      // Call the external API to cancel the flight
      const externalApiUrl = `${process.env.FLIGHT_URL}/api/bookings/cancel`;
      const apiKey = process.env.API_KEY;
      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ lastName: flight.lastName, bookingReference: flight.bookingReference }),
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to cancel flight: ${errorData.message}`);
      }

    } 

    await prisma.itinerary.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Itinerary deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

