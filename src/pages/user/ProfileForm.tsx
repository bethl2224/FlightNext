import React, { useState, useEffect } from "react";
import { ProfileData } from "@pages/user/EditProfile";

interface ProfileFormProps {
  profileData: ProfileData | null; // Allow null initially
  updateProfile: (field: keyof ProfileData, value: string | File) => void;
  saveProfile: (formData: FormData) => Promise<boolean>;
  imageIsChanged: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profileData,
  updateProfile,
  saveProfile,
  imageIsChanged,
}) => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      try {
        // Simulate an API call to fetch profile data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
        setLoading(false); // Data is loaded
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setErrorMessage("Failed to load profile data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("firstName", profileData?.firstName || "");
    formData.append("lastName", profileData?.lastName || "");
    formData.append("email", profileData?.email || "");
    formData.append("phoneNumber", profileData?.phoneNumber || "");

    if (imageIsChanged && profileData?.profilePicture instanceof File) {
      formData.append("profilePicture", profileData.profilePicture);
    }

    try {
      const success = await saveProfile(formData);

      if (success) {
        setSuccessMessage(true);
        setErrorMessage(null);
        setTimeout(() => setSuccessMessage(false), 5000);
      } else {
        setErrorMessage("Failed to save profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading profile data...</p>; // Show loading message while data is being fetched
  }

  if (!profileData) {
    return <p>No profile data available.</p>; // Handle case where profileData is null
  }

  return (
    <section className="flex-1">
      <form className="flex flex-col gap-6 mx-auto my-0 w-full max-w-[600px]">
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 text-base font-semibold text-slate-500"
          >
            First Name
          </label>
          <input
            id="firstName"
            className="p-3 w-full text-base rounded border border-solid border-[color:var(--Grey-200,#CBD4E6)]"
            value={profileData.firstName}
            onInput={(event) =>
              updateProfile(
                "firstName",
                (event.target as HTMLInputElement).value
              )
            }
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 text-base font-semibold text-slate-500"
          >
            Last Name
          </label>
          <input
            id="lastName"
            className="p-3 w-full text-base rounded border border-solid border-[color:var(--Grey-200,#CBD4E6)]"
            value={profileData.lastName}
            onInput={(event) =>
              updateProfile(
                "lastName",
                (event.target as HTMLInputElement).value
              )
            }
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 text-base font-semibold text-slate-500"
          >
            Email
          </label>
          <input
            id="email"
            className="p-3 w-full text-base rounded border border-solid border-[color:var(--Grey-200,#CBD4E6)]"
            type="email"
            value={profileData.email}
            onInput={(event) =>
              updateProfile("email", (event.target as HTMLInputElement).value)
            }
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="mb-2 text-base font-semibold text-slate-500"
          >
            Phone Number
          </label>
          <input
            id="phoneNumber"
            className="p-3 w-full text-base rounded border border-solid border-[color:var(--Grey-200,#CBD4E6)]"
            type="tel"
            value={profileData.phoneNumber}
            onInput={(event) =>
              updateProfile(
                "phoneNumber",
                (event.target as HTMLInputElement).value
              )
            }
          />
        </div>
      </form>

      <div className="flex flex-col items-center mt-6">
        <button
          className="px-6 py-3 text-base text-white bg-indigo-500 rounded cursor-pointer border-[none]"
          onClick={handleSave}
          aria-label="Save profile changes"
        >
          Save Changes
        </button>
        {successMessage && (
          <p className="mt-4 text-sm text-green-500">
            Profile saved successfully!
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    </section>
  );
};

export default ProfileForm;
