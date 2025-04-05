import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
      include: { hotel: true },
    });

    return NextResponse.json(user.hotel, { status: 200 });
  } catch (error) {
    console.error("Error details:", error);

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
