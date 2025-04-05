import { NextResponse } from "next/server";

const baseUrl = process.env.FLIGHT_URL; // Base URL from environment variables
const apiKey = process.env.API_KEY; // API key from environment variables

export async function GET() {
  // List of flight IDs to fetch
  const flightIds = [
    "c803d07f-6785-4168-97d8-a737996a498a",
    "20036a89-f4ff-4359-8b6e-306ea6584a8c",
    "f78feef9-b4e8-4a96-9139-2c769befa75b",
    "5c445333-33d6-4294-887d-f2a0fc8f9ce2",
    "6d6d67d1-da7c-48fe-b9db-a773769bfd18",
  ];

  try {
    // Fetch flight details for each ID concurrently
    const flightPromises = flightIds.map((id) =>
      fetch(`${baseUrl}/api/flights/${id}`, {
        headers: {
          "x-api-key": apiKey,
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch flight with ID: ${id}`);
        }
        return response.json();
      })
    );

    // Wait for all API calls to complete
    const flightResponses = await Promise.all(flightPromises);

    // Extract only the required fields from each flight
    const flights = flightResponses.map((flight) => ({
        id: flight.id,
      origin: flight.origin.code,
      destination: flight.destination.code,
      origin_name: flight.origin.city,
      dest_name: flight.destination.city,
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      status: flight.status,
    }));

    // Return the list of flight objects
    return NextResponse.json(flights, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return NextResponse.json(
      { message: "Error fetching flights", error: error.message },
      { status: 500 }
    );
  }
}