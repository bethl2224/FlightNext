import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
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

    // Find the owner using the account ID
    const owner = await prisma.hotelOwner.findUnique({
      where: {
        accountId: account.id,
      },
    });
    console.log(owner);

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Find all hotels with the specified room type
    // Note : we will make sure selected room type is available in the hotel
    const hotels = await prisma.hotel.findMany({
      where: {
        ownerId: owner.id,
      },
      include: {
        roomTypes: {
          select: {
            // Select only the room type
            roomType: true,
          },
        },
      },
    });

    // Create a Set to store unique room types with their associated hotel URLs
    const uniqueRoomTypes = new Set();

    hotels.forEach((hotel) => {
      hotel.roomTypes.forEach((rt) => {
        uniqueRoomTypes.add({
          roomType: rt.roomType,
        });
      });
    });

    // Transform the Set into a list of room types
    const roomTypeList = Array.from(uniqueRoomTypes).map(
      (item) => item.roomType
    );

    // Convert the Set to an array and return as JSON
    return NextResponse.json(roomTypeList, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Unable to retrieve hotel" },
      { status: 500 }
    );
  }
}
