import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import {
  convertDate,
  checkHotelOwner,
  checkHotelExist,
  addMessageQueue,
  customQueueMessage,
} from "@/utils/helper";
import { verifyToken } from "@/utils/auth";

// TODO add accountid

//  As a hotel owner, I want to view and filter my hotel’s booking
//  list by date and/or room type. ✅

export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }
    const hotelId = parseInt(await request.nextUrl.searchParams.get("hotelId"));
    const roomType = await request.nextUrl.searchParams.get("roomType");
    const checkInDate = await request.nextUrl.searchParams.get("checkInDate");
    const checkOutDate = await request.nextUrl.searchParams.get("checkOutDate");
    console.log(typeof checkInDate, typeof checkOutDate, typeof roomType);
    if (!(roomType && hotelId)) {
      return NextResponse.json(
        { error: "Please enter in at least one field" },
        { status: 400 }
      );
    }

    const filter = {};

    if (roomType && hotelId) {
      filter.roomType = roomType;
      filter.hotelId = hotelId;
    }

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelExist(hotelId))) {
      return NextResponse.json(
        { error: "Hotel does not exist" },
        { status: 404 }
      );
    }

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelOwner(account.id, hotelId))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    if (checkInDate) {
      // handling error
      filter.checkInDate = convertDate(checkInDate);
    }

    if (checkOutDate) {
      filter.checkOutDate = convertDate(checkOutDate);
    }

    if (
      filter.checkInDate &&
      filter.checkOutDate &&
      filter.checkOutDate < filter.checkInDate
    ) {
      return NextResponse.json(
        { error: "Check out date cannot be earlier than check in date" },
        { status: 400 }
      );
    }

    filter.hotelRoomType = {
      // Replace `hotelId_roomType` with your actual composite key name
      hotelId: hotelId,
      roomType: roomType,
    };

    const room = await prisma.hotelRoomType.findUnique({
      where: { hotelId_roomType: filter.hotelRoomType },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // console.log("ROOM " +  room);
    const bookings = await prisma.hotelBookingRecord.findMany({
      where: {
        hotelId: hotelId,
        roomType: roomType,
        checkInDate: {
          gte: filter.checkInDate,
        },
        checkOutDate: {
          lte: filter.checkOutDate,
        },
      },
    });

    return NextResponse.json({ bookings, room }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get room info" },
      { status: 500 }
    );
  }
}

// As a hotel owner, I want to cancel a hotel reservation,
// so that I have flexibility in managing my hotel. ✅

export async function DELETE(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }
    const bookingId = parseInt(
      await request.nextUrl.searchParams.get("bookingId")
    );

    if (!bookingId) {
      return NextResponse.json(
        { error: "Please enter in booking id" },
        { status: 400 }
      );
    }
    const bookingExist = await prisma.hotelBookingRecord.findUnique({
      where: { id: bookingId },
    });

    if (!bookingExist) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    //check if hotel owner is authorized to modify the hotel resource
    if (!(await checkHotelOwner(account.id, bookingExist.hotelId))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    //delete hotel booking record
    const deletedBooking = await prisma.hotelBookingRecord.delete({
      where: { id: bookingId },
    });

    // // find user account, then add delete message queue
    const findUserAccount = await prisma.User.findUnique({
      where: { id: bookingExist.userId },
    });

    // As a user, I want to receive notifications when
    //  I book a new itinerary, and when there are
    //  external changes to my booking
    // (e.g., cancellation by me or hotel owner).
    console.log(findUserAccount);
    const message = await customQueueMessage(
      "HotelBookingRecord",
      findUserAccount.accountId,
      account.id,
      deletedBooking,
      "Delete"
    );

    await addMessageQueue(
      "HotelBookingRecord",
      findUserAccount.accountId,
      "USER", //add message for USER
      message
    );

    return NextResponse.json(
      { messsage: `Booking with id: ${bookingId} has been deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      {
        error:
          "Failed to delete booking. booking might not exist. Please try again.",
      },
      { status: 500 }
    );
  }
}
