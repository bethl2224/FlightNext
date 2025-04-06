import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
// Helper function to calculate the number of nights
import { calculateNights } from "@/utils/fetch-flight";
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
    console.log(itinerary.flights)

  // Fetch flight booking info for each flight using get_flight_bookings
  const flightInfoPromises = itinerary.flights.map(async (flight) => {
    try {


         // Call the external API to retrieve the flight info
         const externalApiUrl = `${process.env.FLIGHT_URL}/api/bookings/retrieve?lastName=${flight.lastName}&bookingReference=${flight.bookingReference}`;
         const apiKey = process.env.API_KEY;
         const response = await fetch(externalApiUrl, {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
             "x-api-key": apiKey,
           },
         });
         
         if (!response.ok) {
           throw new Error(`Error fetching flight info: ${response.statusText}`);
         }
    
      const flightInfo = await response.json();
      return flightInfo;
    } catch (error) {
      console.error(
        `Failed to fetch flight info for bookingReference: ${flight.bookingReference}`,
        error
      );
      return null; // Handle errors gracefully
    }
  });

  const flightInfos = await Promise.all(flightInfoPromises);
  console.log(flightInfos)
  let flightPrice = 0;



  
// Map flight info to corresponding flights and compute total price
itinerary.flights = itinerary.flights.map((flight, index) => {
  const flightInfo = flightInfos[index];
  if (flightInfo) {
     // Add the price of the flight to the total flight price
     flightPrice += flightInfo.flights.reduce((total, flight) => total + (flight.price || 0), 0);


    return {
      ...flight,
      bookingInfo: flightInfo, // Include the full flight object
    };
  }
  return flight;
});

console.log(flightPrice)


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
    
      // Fetch the hotel details (including the name)
      const hotelDetails = await prisma.hotel.findUnique({
        where: {
          id: hotel.hotelId,
        },
        select: {
          name: true, // Fetch only the hotel name
        },
      });
     
    
      // Add the room types and hotel name to the hotelBookings array
      hotel.roomTypes = roomTypes; // Add room types to the hotel booking
      hotel.hotelName = hotelDetails?.name || "Unknown Hotel"; // Add hotel name to the hotel booking
    
      // Calculate the price for the booked room type
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
        total
      },
      hotelRoomTypes, // Include all room types for the hotels
    };


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

