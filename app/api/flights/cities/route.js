import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("city") || "";

  try {
    const cities = await prisma.location.findMany({
      where: {
        city: {
          startsWith: query, // Match cities starting with the query
          mode: "insensitive", // Case-insensitive matching
        },
      },
      select: {
        city: true,
        country: true,
      },
    });

    if (cities.length === 0) {
      return NextResponse.json({ message: "No cities found" }, { status: 404 });
    }

    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error("Error fetching cities:", error.stack);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}