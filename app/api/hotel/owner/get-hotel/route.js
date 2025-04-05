import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { countBookingRecordByHotelRoomType } from "@/utils/helper";
import { aggregateHotelInfo } from "@/utils/hotel-query";

export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const hotelOwner = await prisma.hotelOwner.findUnique({
      where: {
        accountId: account.id,
      },
    });

    if (!hotelOwner) {
      return NextResponse.json(
        { error: "Hotel owner not found" },
        { status: 404 }
      );
    }

    const hotels = await prisma.hotel.findMany({
      where: {
        ownerId: hotelOwner.id,
      },
      include: {
        location: true,
        images: true,
        owner: true,
        users: true,
        roomTypes: {
          include: {
            bookings: true,
            images: true,
          },
        },
      },
    });
    const hotelNoImage = [];
    const res = [];
    for (const hotel of hotels) {
      if (hotel.roomTypes.length === 0) {
        hotelNoImage.push({
          name: hotel.name,
          hotelId: hotel.id,
          starRating: hotel.starRating,
          logo: hotel.logo,
          address: hotel.address,
          city: hotel.location.city,
          country: hotel.location.country,
        });
      }
      for (const hotelRoomType of hotel.roomTypes) {
        console.log("IMAGES***************");
        console.log(hotelRoomType.images);
        console.log("***************IMAGES");

        res.push({
          name: hotel.name,
          hotelId: hotel.id,
          starRating: hotel.starRating,
          logo: hotel.logo,
          address: hotel.address,
          roomType: hotelRoomType?.roomType,
          pricePerNight: hotelRoomType.pricePerNight,
          amenities: hotelRoomType.amenities,
          numRoomAvailable: countBookingRecordByHotelRoomType(
            hotelRoomType,
            new Date(),
            new Date()
          ),
          city: hotel.location.city,
          country: hotel.location.country,
          roomTypeImages: hotelRoomType.images.map((image) => image.url),
          images: hotel.images.map((image) => image.url),
        });
      }
    }

    return NextResponse.json([aggregateHotelInfo(res), hotelNoImage], {
      status: 200,
    });
  } catch (error) {
    console.error("Error getting hotel:", error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
