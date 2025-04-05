import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(request) {
  try {
    // Get the query parameter from the request URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    let city, country;

    if (query.includes(",")) {
      // If the query contains a comma, split it into city and country
      [city, country] = query.split(",").map((part) => part.trim());
    } else {
      // If the query does not contain a comma, treat it as an airport name
      const airport = await prisma.airport.findFirst({
        where: {
          name: {
            equals: query, // Match the airport name exactly
            mode: "insensitive", // Case-insensitive search
          },
        },
        include: {
          location: true, // Include the associated location
        },
      });

      if (!airport || !airport.location) {
        return NextResponse.json({ error: "Airport not found" }, { status: 404 });
      }

      city = airport.location.city;
      country = airport.location.country;
    }

    if (!city || !country) {
      return NextResponse.json({ error: "City and country are required" }, { status: 400 });
    }

    // Fetch hotels for the determined city and country using AND conditions
    const hotels = await prisma.hotel.findMany({
      where: {
        location: {
          AND: [
            { city: { equals: city, mode: "insensitive" } },
            { country: { equals: country, mode: "insensitive" } },
          ],
        },
      },
      include: {
        location: true, // Include location details
        images: true,   // Include hotel images
      },
    });

    return NextResponse.json(hotels, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}