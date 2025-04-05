import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { convertDate } from "@/utils/helper";
export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const checkInDate = await request.nextUrl.searchParams.get("checkInDate");
    const checkOutDate = await request.nextUrl.searchParams.get("checkOutDate");
    const roomType = await request.nextUrl.searchParams.get("roomType");
    console.log("PARAMS");
    console.log(checkInDate, checkOutDate, roomType);
    if (!checkInDate && !checkOutDate && !roomType) {
      return NextResponse.json(
        { error: "Please enter a field" },
        { status: 400 }
      );
    }

    const filter = {};

    if (checkInDate) {
      // handling error
      filter.checkInDate = { gte: convertDate(checkInDate) };
    }

    if (checkOutDate) {
      filter.checkOutDate = { lte: convertDate(checkOutDate) };
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

    let hotel;
    if (roomType && roomType != "All") {
      hotel = await prisma.hotel.findMany({
        where: {
          ownerId: hotelOwner.id,
          roomTypes: {
            some: {
              roomType: roomType, // Filter by roomType
            },
          },
        },
        include: {
          roomTypes: true, // Include the HotelRoomType relation
        },
      });
    } else {
      //find all hotel
      hotel = await prisma.hotel.findMany({
        where: {
          ownerId: hotelOwner.id,
        },
        include: {
          roomTypes: true, // Include the HotelRoomType relation
        },
      });
    }

    console.log("ALL HOTEL");
    console.log(hotel);
    console.log("**************************");

    // Find all hotels belonging to the owner
    if (roomType == "All") {
      const roomTypeBooking = {};
      for (const h of hotel) {
        const hotelName = h.name;

        roomTypeBooking[hotelName] = {};
        for (const rt of h.roomTypes) {
          let bookings = await prisma.hotelBookingRecord.findMany({
            where: {
              hotelId: h.id,

              roomType: rt.roomType,
            },
          });

          if (bookings.length > 0) {
            roomTypeBooking[hotelName][rt.roomType] = bookings;
          }
        }
      }

      return NextResponse.json({ roomTypeBooking }, { status: 200 });
    }

    //pass in roomtype only
    const roomTypeBooking = {};
    if (roomType && !checkInDate && !checkOutDate) {
      for (const h of hotel) {
        const hotelName = h.name;
        roomTypeBooking[hotelName] = {};
        let bookings = await prisma.hotelBookingRecord.findMany({
          where: {
            hotelId: hotelName.id,
            roomType: roomType,
          },
        });
        if (bookings.length > 0) {
          roomTypeBooking[hotelName][roomType] = bookings;
        }
      }
      // only filter by check in date and checkout date
    } else if ((checkInDate || checkInDate) && !roomType) {
      for (const h of hotel) {
        const hotelName = h.name;
        roomTypeBooking[hotelName] = {};
        for (const rt of h.roomTypes) {
          let bookings = await prisma.hotelBookingRecord.findMany({
            where: {
              hotelId: h.id,
              roomType: rt.roomType,
              ...filter,
            },
          });
          if (bookings.length > 0) {
            roomTypeBooking[hotelName][rt.roomType] = bookings;
          }
        }
      }
    } else {
      // passing in hotel  or check in date
      for (const h of hotel) {
        const hotelName = h.name;
        roomTypeBooking[hotelName] = {};

        let bookings = await prisma.hotelBookingRecord.findMany({
          where: {
            hotelId: h.id,
            roomType: roomType,
          },
        });

        //additional query to find all bookings within range

        if (filter.checkInDate || filter.checkOutDate) {
          bookings = await prisma.hotelBookingRecord.findMany({
            where: {
              hotelId: h.id,
              roomType: roomType,
              ...filter,
            },
          });
        }

        if (bookings.length > 0) {
          roomTypeBooking[hotelName][roomType] = bookings;
        }
      }
    }

    console.log(roomTypeBooking);

    return NextResponse.json({ roomTypeBooking }, { status: 200 });

    //check if hotel owner is valid in modify the hotel resource
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    );
  }
}
