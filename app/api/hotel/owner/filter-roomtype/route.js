import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { convertDate, countBookingRecordByHotelRoomType } from "@/utils/helper";
import { aggregateHotelInfo } from "@/utils/hotel-query";
//As a hotel owner, I want to view room availability (per room type) for specific date ranges to better understand occupancy trends..

import { verifyToken } from "@/utils/auth";
// check missing required fields
// check create room ok

export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const roomType = await request.nextUrl.searchParams.get("roomType");
    const checkInDate = await request.nextUrl.searchParams.get("checkInDate");
    const checkOutDate = await request.nextUrl.searchParams.get("checkOutDate");

    if (!roomType) {
      return NextResponse.json(
        { error: "Please enter room type" },
        { status: 400 }
      );
    }

    if (!checkInDate && !checkOutDate) {
      return NextResponse.json(
        { error: "Please enter city and check-in and check-out dates" },
        { status: 400 }
      );
    }

    const checkInDateObj = convertDate(checkInDate);
    const checkOutDateObj = convertDate(checkOutDate);

    // Find all hotels with the specified room type
    // Note : we will make sure selected room type is available in the hotel
    const hotelsWithRoomType = await prisma.hotelRoomType.findMany({
      where: {
        roomType: roomType,
      },
      select: {
        hotelId: true,
      },
    });

    if (!hotelsWithRoomType || hotelsWithRoomType.length === 0) {
      return NextResponse.json(
        { error: "No hotels found with the specified room type" },
        { status: 404 }
      );
    }

    const hotelIds = hotelsWithRoomType.map((hotel) => hotel.hotelId);

    const owner = await prisma.hotelOwner.findUnique({
      where: {
        accountId: account.id,
      },
    });

    // Fetch the full hotel objects based on the hotel IDs
    const hotels = await prisma.hotel.findMany({
      where: {
        id: {
          in: hotelIds,
        },
        ownerId: owner.id, // Ensure the hotels belong to the authenticated hotel owner
      },
      include: {
        location: true,
        images: true,
        roomTypes: {
          where: {
            roomType: roomType,
          },
          include: {
            bookings: true,
            images: true,
          },
        },
      },
    });

    if (!hotels || hotels.length === 0) {
      return NextResponse.json(
        { error: "No hotels found with the specified room type" },
        { status: 404 }
      );
    }
    const res = [];

    for (const hotel of hotels) {
      for (const hotelRoomType of hotel.roomTypes) {
        // console.log(hotelRoomType.bookings);
        const availableRooms = countBookingRecordByHotelRoomType(
          hotelRoomType,
          checkInDateObj,
          checkOutDateObj
        );

        res.push({
          name: hotel.name,
          hotelId: hotel.id,
          starRating: hotel.starRating,
          logo: hotel.logo,
          address: hotel.address,
          roomType: hotelRoomType?.roomType,
          pricePerNight: hotelRoomType.pricePerNight,
          amenities: hotelRoomType.amenities,
          numRoomAvailable: availableRooms,
          city: hotel.location.city,
          country: hotel.location.country,
          roomTypeImages: hotelRoomType.images.map((image) => image.url),
          images: hotel.images.map((image) => image.url),
        });
      }
    }

    return NextResponse.json(aggregateHotelInfo(res), { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Unable to retrieve hotel" },
      { status: 500 }
    );
  }
}
