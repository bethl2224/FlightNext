import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import {
  convertDate,
  countBookingRecordByHotelRoomType,
  addMessageQueue,
  customQueueMessage,
} from "@/utils/helper";
import { verifyToken } from "@/utils/auth";

export async function GET(request) {
  try {
    const a_user = await verifyToken(request);
    if (!a_user) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    // Find the user by accountId
    const user = await prisma.user.findUnique({
      where: { accountId: a_user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Retrieve all bookings for the user
    const bookings = await prisma.hotelBookingRecord.findMany({
      where: { userId: user.id },
    });
    const bookingsWithHotelDetails = await Promise.all(
      bookings.map(async (booking) => {
        const hotel = await prisma.hotel.findUnique({
          where: { id: booking.hotelId },
          select: {
            name: true,
            city: true,
            country: true,
            address: true,
            starRating: true,
            logo: true,
          },
        });

        return {
          ...booking,
          hotelName: hotel?.name || null,
          hotelCity: hotel?.city || null,
          hotelCountry: hotel?.country || null,
          hotelAddress: hotel?.address || null,
          hotelStarRating: hotel?.starRating || null,
          hotelLogo: hotel?.logo || null,
        };
      })
    );

    return NextResponse.json(bookingsWithHotelDetails, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}
// user able to create hotel booking  ✅
// should notify hotel owner when a new booking is made ✅
export async function POST(request) {
  try {
    const a_user = await verifyToken(request);
    if (!a_user) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { creditCardInfo, checkInDate, checkOutDate, hotelId, roomType } =
      await request.json();
    let checkInDateObj, checkOutDateObj; // initialize checkin and checkout object

    if (
      !creditCardInfo ||
      !checkInDate ||
      !checkOutDate ||
      !hotelId ||
      !roomType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      checkInDateObj = convertDate(checkInDate);
      checkOutDateObj = convertDate(checkOutDate);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (checkInDateObj > checkOutDateObj) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 }
      );
    }

    // console.log(creditCardInfo, checkInDate, checkOutDate, hotelId, roomType);

    // Check if hotelId exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Check if userId exists
    const user = await prisma.user.findUnique({
      where: { accountId: a_user.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = {
      creditCardInfo: creditCardInfo,
      checkInDate: checkInDateObj,
      checkOutDate: checkOutDateObj,
      roomType: roomType,
      hotelId: hotelId,
      userId: user.id, // replace with authenticated user id
    };
    // check if room is available
    const available = await countBookingRecordByHotelRoomType(
      roomType,
      checkInDate,
      checkOutDate
    );
    if (available <= 0) {
      return NextResponse.json(
        { error: "Room not available for booking" },
        { status: 400 }
      );
    }

    const newBooking = await prisma.hotelBookingRecord.create({
      data: payload,
    });

    //add hotelBookingRecord to message queue
    // As a hotel owner, I want to receive notifications
    // when a new booking is made for my hotel.

    //find owner of hotel
    const hotelOwner = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { owner: true },
    });

    const message = await customQueueMessage(
      "HotelBookingRecord",
      user.accountId,
      null,
      newBooking,
      "Create"
    );

    console.log("message", message);
    await addMessageQueue(
      "HotelBookingRecord",
      hotelOwner.owner.accountId,
      "HOTEL-OWNER",
      message
    );

    const message2 = await customQueueMessage(
      "HotelBookingRecord",
      null,
      null,
      newBooking,
      "User-Create"
    );
    await addMessageQueue(
      "HotelBookingRecord",
      user.accountId,
      "USER",
      message2,
      "User-Create"
    );

    console.log("MeSSAGES");
    console.log(message, message2);

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json(
      {
        error: "Failed to create booking. Please enter in all required fields",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const a_user = await verifyToken(request);
    if (!a_user) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Find the user by accountId
    const user = await prisma.user.findUnique({
      where: { accountId: a_user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the booking to ensure it belongs to the user
    const booking = await prisma.hotelBookingRecord.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Find the hotel owner through the booking
    const hotel = await prisma.hotel.findUnique({
      where: { id: booking.hotelId },
      include: { owner: true },
    });

    if (!hotel || !hotel.owner) {
      return NextResponse.json(
        { error: "Hotel or hotel owner not found" },
        { status: 404 }
      );
    }

    const hotelOwnerId = hotel.owner.accountId;
    // add message to queue

    // Delete the booking
    await prisma.hotelBookingRecord.delete({
      where: { id: bookingId },
    });

    const message = await customQueueMessage(
      "HotelBookingRecord",
      user.accountId,
      null,
      booking,
      "User-cancelled"
    );

    console.log("**********************");
    console.log(user.accountId, hotelOwnerId);
    console.log("**********************");
    await addMessageQueue(
      "HotelBookingRecord",
      user.accountId,
      "USER",
      message
    );

    // // Notify hotel owner of booking cancellation
    const message2 = await customQueueMessage(
      "HotelBookingRecord",
      user.accountId,
      null,
      booking,
      "User-Delete"
    );

    await addMessageQueue(
      "HotelBookingRecord",
      hotelOwnerId,
      "HOTEL-OWNER",
      message2
    );

    return NextResponse.json(
      { message: "Booking deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
