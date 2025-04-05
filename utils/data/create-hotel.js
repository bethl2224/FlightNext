import { S3Client } from "@aws-sdk/client-s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { users, hotelPayload } from "./generate-user.js";
// import { prisma } from "../db.js";
// import { verifyToken } from "../auth.js";
import dotenv from "dotenv";
dotenv.config();
console.log("S3_BUCKET_NAME_HOTEL:", process.env.S3_BUCKET_NAME_HOTEL);

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export const s3Client_HOTEL = new S3Client({
  region: process.env.S3_REGION_HOTEL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID_HOTEL,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY_HOTEL,
  },
});

export const getImagesFromDirectoryHotel = async (directory) => {
  try {
    if (!process.env.S3_BUCKET_NAME_HOTEL) {
      throw new Error("Missing S3_BUCKET_NAME_HOTEL environment variable");
    }

    const command = new ListObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME_HOTEL,
      Prefix: directory,
    });

    const response = await s3Client_HOTEL.send(command);
    console.log("Response from S3:", response);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => {
      return `https://${process.env.S3_BUCKET_NAME_HOTEL}.s3.${process.env.S3_REGION_HOTEL}.amazonaws.com/${item.Key}`;
    });
  } catch (error) {
    console.error("Error fetching images from directory:", error.stack);
    return []; // Ensure the function always returns an array
  }
};

export const getImagesFromDirectory = async (directory) => {
  try {
    if (!process.env.S3_BUCKET_NAME) {
      throw new Error("Missing S3_BUCKET_NAME_HOTEL environment variable");
    }

    const command = new ListObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: directory,
    });

    const response = await s3Client.send(command);
    console.log("Response from S3:", response);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => {
      return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${item.Key}`;
    });
  } catch (error) {
    console.error("Error fetching images from directory:", error.stack);
    return []; // Ensure the function always returns an array
  }
};

// Wrap in an async function to avoid top-level await issues
// (async () => {
//   //   const hotelImages = await getImagesFromDirectory("Hotels");

//   //   const roomImages = await getImagesFromDirectory("Room-Type");

//   // Uncomment the lines below to test with different directories
//   const hotelImages = await getImagesFromDirectoryHotel("Hotel/hotel-2");
//   const roomImages = await getImagesFromDirectoryHotel("Hotel/room-2");
//   const logoImages = await getImagesFromDirectoryHotel("Hotel/logo-2");

//   console.log("HotelImages:", hotelImages);
//   console.log("RoomImages:", roomImages);
//   console.log("LogoImages", logoImages);
// })();

// Function to sign in and retrieve the access token
export async function signInAndGetToken(username, password, user = "owner") {
  const payload = {
    username: username,
    password: password,
    role: user,
  };

  try {
    const response = await fetch(`${process.env.API_URL}/api/account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to sign in. Check your credentials.");
    }

    const data = await response.json();
    console.log("Sign-in response:", data);

    // Assuming the token is returned in the `accessToken` field
    return [data.accessToken, data.refreshToken];
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
}
async function createHotel(accessToken, refreshToken, hotel) {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/hotel/testing/add_hotel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Pass the JWT token as Bearer
          Cookie: [
            `accessToken=${accessToken}; Path=/; HttpOnly`,
            `refreshToken=${refreshToken}; Path=/; HttpOnly`,
          ].join("; "), // Send cookies in the Cookie header
        },
        body: JSON.stringify(hotel),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to create hotel: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("****************************");
    console.log("Hotel created:", data);
    console.log("****************************");
  } catch (error) {
    console.error("Error creating hotel:", error);
  }
}

// const username = "mulan.2222";
// const password = "mul666888";

export async function createHotelRandom() {
  try {
    for (const el of hotelPayload) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const username = randomUser.username;
      const password = randomUser.password;
      // Sign in and get the JWT token
      const [accessToken, refreshToken] = await signInAndGetToken(
        username,
        password,
        "user"
      );
      console.log("Access Token:", accessToken, refreshToken);
      // // Use the JWT token to create hotels
      await createHotel(accessToken, refreshToken, el);
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log("Hotels created successfully.");
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// createHotelRandom();
