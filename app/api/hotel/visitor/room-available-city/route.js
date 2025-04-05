import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { convertDate, countBookingRecordByHotelRoomType } from "@utils/helper";

export async function GET(request) {
  try {
    // Parse query parameters
    const hotelName = request.nextUrl.searchParams.get("hotelName");
    const checkInDate = request.nextUrl.searchParams.get("checkInDate");
    const checkOutDate = request.nextUrl.searchParams.get("checkOutDate");

    if (!hotelName) {
      return NextResponse.json(
        { error: "Please enter a hotel name" },
        { status: 400 }
      );
    }

    if (!checkInDate || !checkOutDate || checkInDate > checkOutDate) {
      return NextResponse.json(
        { error: "Please enter valid check-in and check-out dates" },
        { status: 400 }
      );
    }

    // Convert dates to proper format
    const formattedCheckInDate = convertDate(checkInDate);
    const formattedCheckOutDate = convertDate(checkOutDate);

    // Fetch the first hotel that matches the exact name
    const hotel = await prisma.hotel.findFirst({
      where: {
        name: hotelName, // Match the exact hotel name
      },
      include: {
        location: true, // Include location details
        images: true,   // Include hotel images
        owner: true,    // Include hotel owner details
        roomTypes: {    // Include room types and their bookings
          include: {
            bookings: true,
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "No hotel found with the specified name" },
        { status: 404 }
      );
    }

    // Check for available rooms in the hotel
    const availableRoomTypes = [];
    for (const roomType of hotel.roomTypes) {
      const availableCount = await countBookingRecordByHotelRoomType(
        roomType,
        formattedCheckInDate,
        formattedCheckOutDate
      );

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

    // Return the hotel details with available rooms
    const result = {
      hotelName: hotel.name,
      location: hotel.location,
      images: hotel.images,
      owner: hotel.owner,
      availableRoomTypes,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json(
      { error: "Unable to retrieve hotel information" },
      { status: 500 }
    );
  }
}