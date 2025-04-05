import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";  // Assuming you're using Prisma for database access
import { verifyToken } from "@/utils/auth"; // Assuming you have a token verification utility

export async function PUT(req) {
  try {
    // Parse the request body
    const itineraryId = parseInt(req.nextUrl.searchParams.get("itineraryId"));
    const creditCardNumber = req.nextUrl.searchParams.get("creditCardNumber");

    // Validate input
    if (!itineraryId || !creditCardNumber) {
      return NextResponse.json(
        { error: "Itinerary ID and credit card number are required." },
        { status: 400 }
      );
    }

    // Validate credit card number (16 digits)
    const creditCardRegex = /^[0-9]{16}$/;
    if (!creditCardRegex.test(creditCardNumber)) {
      return NextResponse.json(
        { error: "Invalid credit card number format." },
        { status: 400 }
      );
    }

    // Verify the user's authentication
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    // Find the user associated with the account
    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the itinerary by ID and ensure it belongs to the user
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { hotelBookings: true, flights: true }, // Include hotel bookings and flights in the query
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found." },
        { status: 404 }
      );
    }

    if (itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to modify this itinerary." },
        { status: 403 }
      );
    }

    // Update the credit card info for all hotel bookings
    await Promise.all(
      itinerary.hotelBookings.map((hotelBooking) =>
        prisma.hotelBookingRecord.update({
          where: { id: hotelBooking.id },
          data: { creditCardInfo: creditCardNumber },
        })
      )
    );

    return NextResponse.json(
      {itinerary, message: "Credit card information updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating credit card info:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}