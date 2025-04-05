import { NextResponse } from "next/server";
import { verifyRefreshToken, generateToken } from "@/utils/auth";

export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const payload = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      createdAt: decoded.createdAt,
      expiresAt: Date.now() + process.env.ACCESS_EXPIRE * 60 * 1000, // 30 minutes
    };

    const accessToken = generateToken(payload);

    const response = NextResponse.json(
      { message: "Token refreshed successfully", accessToken },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=1800`, // 30 minutes
    ]);

    return response;
  } catch (error) {
    console.error("Error during token refresh:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
