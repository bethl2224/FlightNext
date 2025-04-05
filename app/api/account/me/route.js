import { verifyToken } from "@/utils/auth"; // Utility to verify JWT
import { getUserById } from "@/utils/db"; // Utility to fetch user from DB
import { NextResponse } from "next/server";

export async function GET() {
    try {
      // Verify the token and decode it
      const decoded = await verifyToken();
      if (!decoded) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
  
      // Fetch user info from the database
      const user = await getUserById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Return the user data
      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      console.error("Error fetching user info:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }