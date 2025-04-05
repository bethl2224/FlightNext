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

    const { hotelId } = await request.json();

    const a_user = await prisma.user.findUnique({
      where: { accountId: account.id },
      include: { hotel: true },
    });

    // Disconnect the hotel from the user
    const disconnectHotel = await prisma.user.update({
      where: { accountId: a_user.accountId },
      data: { hotel: { disconnect: { id: hotelId } } },
    });

    return NextResponse.json(disconnectHotel, { status: 200 });
  } catch (error) {
    console.error("Error details:", error);

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
