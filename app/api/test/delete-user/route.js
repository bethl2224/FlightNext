import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";

export async function DELETE(request) {
  const account = await verifyToken(request);
  if (!account) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }
  const deleteAccount = await prisma.account.delete({
    where: {
      id: account.id,
    },
  });
  return NextResponse.json(deleteAccount, { status: 200 });
}
