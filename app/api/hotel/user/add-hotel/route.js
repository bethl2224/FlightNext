import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
export async function POST(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    console.log(id);

    // console.log("*****************");
    // console.log(id);
    // console.log("*****************");

    const hotel = await prisma.hotel.findUnique({
      where: { id: id },
    });

    // console.log(hotel);

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const a_user = await prisma.account.findUnique({
      where: {
        username: account.username,
        password: account.password, //given user is already authenticated
      },
      include: { user: true },
    });
    console.log(a_user.user.accountId);

    //update user by adding the new hotel
    await prisma.user.update({
      where: { accountId: a_user.user.accountId },
      data: { hotel: { connect: { id: hotel.id } } },
    });

    //get hotel info
    const hotelInfo = await prisma.user.findUnique({
      where: { accountId: a_user.user.accountId },
      include: { hotel: true },
    });

    return NextResponse.json(hotelInfo, { status: 200 });
  } catch (error) {
    console.error("Error details:", error);

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
