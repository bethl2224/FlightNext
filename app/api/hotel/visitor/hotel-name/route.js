import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { caseSensitiveSearch } from "@/utils/helper";
// As a visitor, I want to view the availability
//  and details of different room types for my
//  selected dates in a selected hotel.

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let name = searchParams.get("name");
    console.log("***************");

    if (!name) {
      return NextResponse.json(null, { status: 204 });
    }

    // case sensitive handling
    name = caseSensitiveSearch(name);
    console.log("Searching for hotel with name:", name);

    const hotel = await prisma.hotel.findMany({
      where: {
        name: {
          contains: name,
        }, // Case-sensitive by default
      },
      include: {
        location: true,
      },
    });
    const res = [];
    for (const h of hotel) {
      res.push({
        name: h.name,
        city: h.location.city,
        country: h.location.country,
      });
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Unable to retrieve hotel" },
      { status: 500 }
    );
  }
}
