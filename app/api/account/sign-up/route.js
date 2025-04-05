import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { hashPassword } from "@utils/auth";
import { getUserByUsername } from "@utils/db";

export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { firstName, lastName, phoneNumber, email, username, password } =
      await req.json(); // Use req.body if using API Routes

    // Validate input
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !username ||
      !password
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

       // Check if email already exists
       const existingUserByEmail = await prisma.account.findUnique({
        where: { email: email },
      });
  
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
  

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.account.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        email: email,
        username: username,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Create user for this account
    await prisma.user.create({
      data: {
        accountId: newUser.id,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: newUser.id, email: newUser.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error Code", error.stack);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
