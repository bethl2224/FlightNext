import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { verifyToken } from "@/utils/auth";

const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function createFlightDetails(
  firstName,
  lastName,
  email,
  passportNumber,
  flightIds
) {
  const url = `${baseUrl}/api/bookings`;
  const payload = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    passportNumber: passportNumber,
    flightIds: flightIds,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error creating flight details: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function POST(req) {
  if (req.method !== "POST") {
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

    const { firstName, lastName, email, passportNumber, flightIds } =
      await req.json();

    if (!firstName || !lastName || !email || !passportNumber || !flightIds) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const data = await createFlightDetails(
      firstName,
      lastName,
      email,
      passportNumber,
      flightIds
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating flight details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
