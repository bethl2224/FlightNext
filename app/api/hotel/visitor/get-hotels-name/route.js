import { prisma } from "@/utils/db.js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get the query parameter from the request URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Fetch hotels where the name starts with the query, selecting only id and name
    const hotels = await prisma.hotel.findMany({
      where: {
        name: {
          startsWith: query, // Match hotel names that start with the query
          mode: "insensitive", // Case-insensitive search
        },
      },
      select: {
        id: true, // Select only the id
        name: true, // Select only the name
        city: true,
        country: true
      },
    });

    return NextResponse.json(hotels, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}