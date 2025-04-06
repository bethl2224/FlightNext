import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { calculateNights } from "@/utils/fetch-flight";
import {
  convertDate,
  customQueueMessage,
  addMessageQueue
} from "@/utils/helper";

import { fetchAndComputeFlightPrices } from "@/utils/fetch-flight";

const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function createFlightDetails(
  firstName,
  lastName,
  email,
  passportNumber,
  flightIds
) {
  const url = `${baseUrl}/api/bookings`;
  const payload = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    passportNumber: passportNumber,
    flightIds: flightIds,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const message = JSON.parse(errorText); // Extract the error message
    const errorMessage = message.error;

    throw new Error(`Error creating flight details: ${errorMessage}`);
  }

  const data = await response.json();
  return data;
}




async function getAvailableRooms(hotelId, roomType, checkInDate, checkOutDate) {
  // Step 1: Fetch the total room capacity for the specified hotel and room type
  const hotelRoomType = await prisma.hotelRoomType.findUnique({
    where: {
      hotelId_roomType: {
        hotelId: hotelId,
        roomType: roomType,
      },
    },
  });

  if (!hotelRoomType) {
    throw new Error(`Room type ${roomType} not found for hotel ID ${hotelId}`);
  }

  const totalCapacity = hotelRoomType.roomCapacity;

  // Step 2: Fetch existing bookings that overlap with the requested dates
  const overlappingBookings = await prisma.hotelBookingRecord.findMany({
    where: {
      hotelId: hotelId,
      roomType: roomType,
      OR: [
        {
          checkInDate: {
            lte: new Date(checkOutDate), // Booking starts before or on the requested check-out date
          },
          checkOutDate: {
            gte: new Date(checkInDate), // Booking ends after or on the requested check-in date
          },
        },
      ],
    },
  });

  // Step 3: Calculate the number of available rooms
  const bookedRooms = overlappingBookings.length;
  const availableRooms = totalCapacity - bookedRooms;

  return availableRooms;
}




export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

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

    const { flights, hotelBookings } = await req.json();






    if (!flights && !hotelBookings) {
      return NextResponse.json(
        { error: "At least one flight or hotel booking is required" },
        { status: 400 }
      );
    }

    // Create the itinerary object first
    const itinerary = await prisma.itinerary.create({
      data: {
        userId: user.id,
      },
    });

    const payload = {};
    if (flights) {
      payload.bookingReference = flights.bookingReference;
    }
    if (hotelBookings) {
      payload.roomType = hotelBookings.roomType;
      payload.hotelid = hotelBookings.hotelId;
    }

      // Create hotel bookings if provided

      if (hotelBookings && hotelBookings.length > 0) 
      {
          // Step 1: Count occurrences of each room type for each hotel
  const roomTypeCounts = {};
  for (const booking of hotelBookings) {
    const key = `${booking.hotelId}-${booking.roomType}`;
    roomTypeCounts[key] = (roomTypeCounts[key] || 0) + 1;
  }

  // Step 2: Validate room capacity for each room type
  for (const [key, count] of Object.entries(roomTypeCounts)) {
    const [hotelId, roomType] = key.split("-");

    // Fetch the total room capacity and overlapping bookings
    const availableRooms = await getAvailableRooms(
      parseInt(hotelId, 10),
      roomType,
      hotelBookings[0].checkInDate,
      hotelBookings[0].checkOutDate
    );

    // Check if there are enough rooms for the requested bookings
    if (availableRooms < count) {
      // Delete the itinerary if there are not enough rooms
      await prisma.itinerary.delete({
        where: { id: itinerary.id },
      });

      return NextResponse.json(
        {
          error: `Cannot create booking for room type ${roomType} at hotel ID ${hotelId}. Not enough rooms available.`,
        },
        { status: 400 }
      );
    }
  }

        await Promise.all(
          hotelBookings.map((booking) =>
            prisma.hotelBookingRecord.create({
              data: {
                creditCardInfo: booking.creditCardInfo,
                checkInDate: convertDate(booking.checkInDate),
                checkOutDate: convertDate(booking.checkOutDate),
                roomType: booking.roomType,
                hotelId: booking.hotelId,
                userId: user.id,
                itineraryId: itinerary.id,
              },
            })
          )
        );
      }

    const message = await customQueueMessage(
      "Itinerary",
      account.id,
      null,
      null,
      "Create"
    );

    await addMessageQueue("Itinerary", account.id, "USER", message);

    let flightData = "";
    // Create a single flight Booking Info if provided
    if (flights && flights.length > 0) {
      const { firstName, lastName, email, passportNumber, flightIds } =
        flights[0];

      if (!firstName || !lastName || !email || !passportNumber || !flightIds) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      flightData = await createFlightDetails(
        firstName,
        lastName,
        email,
        passportNumber,
        flightIds
      );

      await prisma.flightInfo.create({
        data: {
          lastName: flightData.lastName,
          bookingReference: flightData.bookingReference,
          itineraryId: itinerary.id,
        },
      });
    }

  

    //
    // Fetch the updated itinerary with related flights and hotel bookings
    const updatedItinerary = await prisma.itinerary.findUnique({
      where: { id: itinerary.id },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    return NextResponse.json(
      { Itinerary: updatedItinerary, flight_booking: flightData },
      { status: 201 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
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

    const itineraries = await prisma.itinerary.findMany({
      where: { userId: user.id },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    for (let i = 0; i < itineraries.length; i++) {
      let flightPrice = 0;
      let hotelPrice = 0;
    
      // Fetch flight bookings and compute flight prices
      const { flightBookings, flightPrice: computedFlightPrice } =
        await fetchAndComputeFlightPrices(itineraries[i].flights);
      flightPrice = computedFlightPrice;
    
      // Compute hotel prices

       for (const hotel of itineraries[i].hotelBookings) {
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
      const taxes = subtotal * 0.1; // 10% tax
      const total = subtotal + taxes;
    
      // Add price breakdown to the itinerary
      itineraries[i].priceSummary = {
        flightPrice,
        hotelPrice,
        subtotal,
        taxes,
        total,
      };
      itineraries[i].flightBooking = flightBookings
    }

    return NextResponse.json({ itineraries }, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

