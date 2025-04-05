import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
export async function DELETE(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { hotelId } = await request.json();

    // Disconnect the hotel from the user
    const result = await prisma.user.update({
      where: { id: account.id }, // Replace with the actual user ID
      data: {
        hotel: {
          disconnect: [{ id: hotelId }], // Pass an array of objects
        },
      },
    });

    return NextResponse.json({ ...result, hotelId: hotelId }, { status: 200 });
  } catch (error) {
    console.error("Error details:", error.stack);

    return NextResponse.json(
      { error: "Failed to delete user hotel" },
      { status: 500 }
    );
  }
}
