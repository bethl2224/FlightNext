import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("airport") || "";

  try {
    const airports = await prisma.airport.findMany({
      where: {
        name: {
          startsWith: query, // Match names starting with the query
          mode: "insensitive", // Case-insensitive matching
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        country: true,
      },
    });

    if (airports.length === 0) {
      return NextResponse.json(
        { message: "No airports found" },
        { status: 404 }
      );
    }

    return NextResponse.json(airports, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}