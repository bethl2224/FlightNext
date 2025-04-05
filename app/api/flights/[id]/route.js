import { NextResponse } from "next/server";

const baseUrl = process.env.FLIGHT_URL; // Base URL from environment variables
const apiKey = process.env.API_KEY; // API key from environment variables

export async function GET(req, { params }) {
  const { id } = await params; // Extract the flight ID from the URL

  try {
    // Construct the external API URL
    const url = `${baseUrl}/api/flights/${id}`;

    // Fetch flight details from the external API
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    // Handle errors from the external API
    if (!response.ok) {
      return NextResponse.json(
        { message: `Error fetching flight details: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse the response from the external API
    const flightData = await response.json();

    // Extract the required flight details, including status
    const flightDetails = {
      id: flightData.id,
      departureTime: flightData.departureTime,
      flightNumber: flightData.flightNumber,
      arrivalTime: flightData.arrivalTime,
      duration: flightData.duration,
      layovers: flightData.layovers || [],
      origin: flightData.origin,
      destination: flightData.destination,
      status: flightData.status, // Include the status field
    };

    // Return the flight details as a JSON response
    return NextResponse.json(flightDetails, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flight details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}