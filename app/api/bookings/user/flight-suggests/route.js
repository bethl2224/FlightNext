import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path to your Prisma client
import { verifyToken } from "@/utils/auth";

const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function getFlightDetails(origin, destination, date) {
  const url = `${baseUrl}/api/flights?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(
    date
  )}`;
  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { message: `Error fetching flight details: ${response.statusText}` },
        { status: 400 }
      );
    }
    const data = await response.json();
    if (!data || data.results.length === 0) {
      return NextResponse.json(
        { message: "Flight details not found" },
        { status: 400 }
      );
    }
    return data;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching flight details" },
      { status: 400 }
    );
  }
}

export async function GET(req) {
  if (req.method !== "GET") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const origin = searchParams.get("origin");
    const date = searchParams.get("date");

    if (!hotelId || !origin || !date) {
      return NextResponse.json(
        { error: "Hotel ID, origin, and date are required" },
        { status: 400 }
      );
    }

    if (isNaN(hotelId)) {
      return NextResponse.json({ error: "Invalid Hotel ID" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId) },
      include: { location: true },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const destination = hotel.location.city;

    const flightDetails = await getFlightDetails(origin, destination, date);
    const hotelBookedDate = new Date(date); // Assuming hotel.bookedDate is available
     console.log(origin, destination, date)
    if (!flightDetails.results) {
      return NextResponse.json(
        { error: "Flight details not found" },
        { status: 404 }
      );
    }

    const flights = flightDetails.results
      .filter((result) => {
        if (result.flights.length === 0) return false;
        const firstFlight = result.flights[0];
        const departureDate = new Date(firstFlight.departureTime);

        const departureDateOnly = departureDate.toISOString().split("T")[0];
        const hotelBookedDateOnly = hotelBookedDate.toISOString().split("T")[0];

        return departureDateOnly <= hotelBookedDateOnly;
      })
      .map((result) => ({
        legs: result.legs,
        flights: result.flights.map((flight) => ({
          id: flight.id,
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          originId: flight.originId,
          destinationId: flight.destinationId,
          duration: flight.duration,
          price: flight.price,
          currency: flight.currency,
          availableSeats: flight.availableSeats,
          status: flight.status,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
        })),
      }));

    return NextResponse.json({ flights });
  } catch (error) {
    console.error("Error fetching flight suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
