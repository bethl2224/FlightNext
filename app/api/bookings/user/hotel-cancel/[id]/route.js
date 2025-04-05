import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
import { customQueueMessage, addMessageQueue } from "@/utils/helper";
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
        { error: "Invalid hotel booking ID" },
        { status: 400 }
      );
    }
    console.log(id);
    // this is for adding the hotel notification message
    const booking = await prisma.hotelBookingRecord.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId != user.id) {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 }
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: booking.hotelId },
      include: {
        owner: true,
      },
    });

    const deletedBooking = await prisma.hotelBookingRecord.delete({
      where: { id: parseInt(id) },
    });

    if (!deletedBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // send owner notification that user has cancelled booking

    const ownerMessage = await customQueueMessage(
      "HotelBookingRecord",
      account.id,
      null,
      deletedBooking,
      "User-Delete"
    );

    await addMessageQueue(
      "HotelBookingRecord",
      hotel.owner.accountId,
      "OWNER",
      ownerMessage
    );

    // send user notification that booking has been cancelled
    const deletedData = {
      id: deletedBooking.id,
    };

    const userMessage = await customQueueMessage(
      "Itinerary",
      account.id,
      null,
      deletedData,
      "HotelBooking-Delete"
    );

    await addMessageQueue("Itinerary", account.id, "USER", userMessage);

    const itineraryId = (await prisma.itinerary.findUnique({
      where: { id: booking.itineraryId },
    })).id;

    // Delete the itinerary if there are no more flights or hotel bookings
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    if (itinerary.flights.length === 0 && itinerary.hotelBookings.length === 0) {
      await prisma.itinerary.delete({
        where: { id: itineraryId },
      });


      const delete_itinerary = await customQueueMessage(
        "Itinerary",
        account.id,
        null,
        null,
        { itineraryId },
        "Itinerary-Delete"
      );
      await addMessageQueue("Itinerary", account.id, "USER", delete_itinerary);
    }

    return NextResponse.json(
      { message: "Booking successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
