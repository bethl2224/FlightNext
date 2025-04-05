import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // Import cookies from next/headers
export function hashPassword(password) {
  return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS));
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(object) {
  return jwt.sign(object, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
}
export function generateRefreshToken(object) {
  return jwt.sign(object, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
}
export async function verifyToken() {
  const cookieStore = await cookies(); // Access cookies using next/headers
  const accessToken = await cookieStore.get("accessToken")?.value;
  console.log("Access token:", accessToken);

  if (!accessToken) {
    return null; // No token found
  }

  try {
    // Verify the token using your secret
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    console.log("Decoded token:", decoded);
    return decoded; // Return the decoded token
  } catch (error) {
    console.error("Invalid token:", error);
    return null; // Invalid token
  }
}
export function verifyRefreshToken(refreshToken) {
  if (!refreshToken) {
    console.error("No refresh token provided.");
    return null;
  }

  try {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error("Invalid refresh token:", error);
    return null;
  }
}
