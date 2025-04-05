import { NextResponse } from "next/server";

export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the cookies by setting their expiration date to the past
    response.headers.set("Set-Cookie", [
      "accessToken=; HttpOnly; Path=/; Max-Age=0",
      "refreshToken=; HttpOnly; Path=/; Max-Age=0",
    ]);

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
