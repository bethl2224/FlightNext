import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
import {get_flight_bookings} from "@/utils/fetch-flight";

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
    let itineraryId = searchParams.get("itineraryId");

    if (!lastName || !bookingReference || !itineraryId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (isNaN(itineraryId)) {
      return NextResponse.json(
        { error: "Itinerary ID must be a number" },
        { status: 400 }
      );
    }
    itineraryId = parseInt(itineraryId);

    const userId = account.id;

    // Fetch the related user
    const user = await prisma.user.findUnique({
      where: { accountId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user owns the itinerary
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary Not Found." },
        { status: 404 }
      );
    }

    if (itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to flight booking information." },
        { status: 403 }
      );
    }

    // Fetch the user's flight bookings to verify ownership
    const flightInfo = await prisma.flightInfo.findUnique({
      where: {
        lastName_bookingReference: {
          lastName,
          bookingReference,
        },
        itineraryId: itineraryId,
      },
    });

    if (!flightInfo) {
      return NextResponse.json(
        { error: "Booking not found for this user" },
        { status: 404 }
      );
    }

    const data= await get_flight_bookings(lastName, bookingReference);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching flight information:", error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
