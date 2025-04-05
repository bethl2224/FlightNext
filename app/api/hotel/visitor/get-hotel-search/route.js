import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const hotelName = searchParams.get("hotelName");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");

    // Validate required parameters
    if (!hotelName || !city || !country || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return NextResponse.json(
        { error: "Check-in date must be before check-out date" },
        { status: 400 }
      );
    }

    // Find the hotel based on name and location (city and country)
    const hotel = await prisma.hotel.findFirst({
      where: {
        name: hotelName,
        location: {
          city: city,
          country: country,
        },
      },
      include: {
        roomTypes: {
          include: {
            bookings: true, // Include bookings to check availability
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "No hotel found with the specified details" },
        { status: 404 }
      );
    }

    // Check for available room types
    const availableRoomTypes = [];
    for (const roomType of hotel.roomTypes) {
      // Filter bookings that overlap with the given dates
      const overlappingBookings = roomType.bookings.filter((booking) => {
        const bookingCheckIn = new Date(booking.checkInDate);
        const bookingCheckOut = new Date(booking.checkOutDate);
        return (
          new Date(checkInDate) < bookingCheckOut &&
          new Date(checkOutDate) > bookingCheckIn
        )
      });
      console.log("line 66 ************************")
      console.log("Available Count:", overlappingBookings);
  
      const availableCount = roomType.roomCapacity - overlappingBookings.length;
      console.log("line 70", availableCount)
      if (availableCount > 0) {
        availableRoomTypes.push({
          roomType: roomType.roomType,
          pricePerNight: roomType.pricePerNight,
          roomCapacity: roomType.roomCapacity,
          amenities: roomType.amenities,
          availableCount,
        });
      }
    }

    if (availableRoomTypes.length === 0) {
      return NextResponse.json(
        { error: "No available rooms for the specified dates" },
        { status: 404 }
      );
    }

    // Return the available room types
    return NextResponse.json(
        {
          hotelName: hotel.name,
          id: hotel.id,
          starRating: hotel.starRating,
          address: hotel.address,
          logo: hotel.logo,
          location: hotel.location, // Return the location object
          images: hotel.images, // Include hotel images
          availableRoomTypes,
        },
        { status: 200 }
      );
  } catch (error) {
    console.error("Error fetching available room types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}