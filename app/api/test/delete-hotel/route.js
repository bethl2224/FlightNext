import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function DELETE(request) {
  const { id } = await request.json();
  const deleteHotel = await prisma.hotel.delete({
    where: {
      id: id,
    },
  });
  return NextResponse.json(deleteHotel, { status: 200 });
}
