import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
import { get_flight_bookings } from "@/utils/fetch-flight";

export async function GET(req) {
  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const lastName = searchParams.get("lastName");
    const bookingReference = searchParams.get("bookingReference");

    if (!lastName || !bookingReference) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const userId = account.id;

    // Fetch the related user
    const user = await prisma.user.findUnique({
      where: { accountId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the flight booking using the composite key
    const flightInfo = await prisma.flightInfo.findUnique({
      where: {
        lastName_bookingReference: {
          lastName,
          bookingReference,
        },
      },
      include: {
        itinerary: true, // Include itinerary details to verify ownership
      },
    });

    if (!flightInfo) {
      return NextResponse.json(
        { error: "Booking not found for this user" },
        { status: 404 }
      );
    }

    // Verify that the user owns the itinerary
    if (flightInfo.itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to flight booking information." },
        { status: 403 }
      );
    }

    // Call the method to fetch flight information
    const data = await get_flight_bookings(lastName, bookingReference);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching flight information:", error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}