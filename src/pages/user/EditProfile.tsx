"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For redirection
import ProfileImageSection from "./ProfileImageSection";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import Header from "@pages/main/Header";
import { apiURl } from "@/utils/hotel-query";
import Footer from "@pages/main/Footer";
import "@pages/styles/globals.css";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: File | string; // Can be a File or a URL
}

function EditProfile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIsChanged, setImageIsChanged] = useState(false); // Track if the image has been changed
  const [userRole, setUserRole] = useState<string>("visitor");

  const router = useRouter();

  //fetch role one time
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });

        // Check if the response contains an access token in cookies
        if (!response.ok) {
          console.error("Unauthorized access. Redirecting to homepage...");
          router.push("/");
          return;
        }

        const data = await response.json();
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          profilePicture: data.profilePicture || "", // URL or empty string
        });

        const role = sessionStorage.getItem("role");
        if (data.role == "USER" && role == "user") {
          setUserRole("user");
          //a hotel owner is trying to access user page
        } else if (data.role == "HOTEL-OWNER" && role == "user") {
          setUserRole("user");
        } else {
          setUserRole("owner");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, userRole]);

  const updateProfile = (field: keyof ProfileData, value: string | File) => {
    if (profileData) {
      setProfileData((prevData) => ({
        ...prevData!,
        [field]: value,
      }));
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!profileData) {
    return null;
  }

  return (
    <main className="overflow-hidden bg-white">
      {/* <Header /> */}
      <Header />
      <ProfileHeader />

      <div className="flex flex-col w-full max-md:max-w-full">
        <div className="flex flex-col gap-10 items-center px-5 py-0 mx-auto my-0 w-full max-w-[800px]">
          {/* Profile Image Section */}
          <ProfileImageSection
            profilePicture={profileData.profilePicture}
            onFileChange={(file: File) => {
              updateProfile("profilePicture", file);
              setImageIsChanged(true); // Mark image as changed
            }}
            onRemoveImage={() => {
              updateProfile("profilePicture", "");
              setImageIsChanged(true); // Mark image as changed
            }}
            imageIsChanged={(isChanged) => setImageIsChanged(isChanged)} // Pass callback to track changes
          />

          {/* Profile Form */}
          <ProfileForm
            profileData={profileData}
            updateProfile={updateProfile}
            imageIsChanged={imageIsChanged} // Pass image change status to ProfileForm
            saveProfile={async (formData: FormData) => {
              try {
                const response = await fetch("/api/account/edit-profile", {
                  method: "PATCH",
                  body: formData,
                  credentials: "include",
                });
                return response.ok;
              } catch (error) {
                console.error("Error saving profile:", error);
                return false;
              }
            }}
          />
        </div>

        <Footer />
      </div>
    </main>
  );
}

export default EditProfile;
