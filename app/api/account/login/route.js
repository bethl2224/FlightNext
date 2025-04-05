import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getUserByUsername } from "@utils/db";
import { generateRefreshToken, generateToken } from "@/utils/auth";

export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const data = await req.json();
    console.log(data);
    const { username, password, role } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    let user = await getUserByUsername(username, role);
    console.log("login.js", role, username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      expiresAt: Date.now() + process.env.ACCESS_EXPIRE * 60 * 1000, // 15 minutes
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${
        process.env.ACCESS_EXPIRE * 60
      }`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
        process.env.REFRESH_EXPIRE * 60 * 60 * 24
      }`,
    ]);

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
