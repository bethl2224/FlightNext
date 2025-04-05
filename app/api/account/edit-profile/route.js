import { NextResponse } from "next/server";
import { updateUserById } from "@/utils/db"; // Adjust the import based on your project structure
import { verifyToken } from "@/utils/auth";
import { uploadFileToS3, deleteFileFromS3 } from "@/utils/s3"; // Import the S3 helper method
import { getUserById } from "@/utils/db";
export async function PATCH(req) {
  if (req.method !== "PATCH") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData(); // Parse FormData from the request
    const updates = {};

    // Extract fields from FormData
    // const id = parseInt(formData.get("id"));
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const phoneNumber = formData.get("phoneNumber");
    const profilePicture = formData.get("profilePicture"); // File field

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phoneNumber) updates.phoneNumber = phoneNumber;


    if(!profilePicture|| (profilePicture && profilePicture instanceof File)) {
      
      // Fetch the existing user data to get the current profile picture URL
      const existingUser = await getUserById(user.id);
      const existingProfilePictureUrl = existingUser?.profilePicture;

      // Delete the existing profile picture from S3 if it exists
      if (existingProfilePictureUrl) {
        const key = existingProfilePictureUrl.split("/").pop(); // Extract the S3 key from the URL
        await deleteFileFromS3("profile-pictures", key);
      }


    }

    // Handle profile picture upload
    if (profilePicture && profilePicture instanceof File) {
      const arrayBuffer = await profilePicture.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadFileToS3(
        fileBuffer,
        `profile-picture-${user.id}`,
        "profile-pictures"
      );


      if (!uploadResult) {
        return NextResponse.json(
          { error: "Failed to upload profile picture" },
          { status: 500 }
        );
      }

      updates.profilePicture = uploadResult.imageUrl;
    }else if (!profilePicture) {
      // If profilePicture is null or empty, set it to null in the database
      updates.profilePicture = null;
    }


    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 }
      );
    }


    await updateUserById(user.id, updates);

    return NextResponse.json(
      { message: "Profile updated successfully", updates },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error.stack);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}