"use client";
import * as React from "react";
import { useRouter } from "next/navigation"; // For redirection

interface SignOutModalProps {
  onLogout: () => void;
}

function SignOut({ onLogout }: SignOutModalProps) {
  const router = useRouter(); // Initialize the router for redirection

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/account/logout`,
        {
          method: "POST",
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.ok) {
        sessionStorage.clear();
        sessionStorage.setItem("role", "visitor");

        console.log("User signed out successfully.");
        onLogout(); // Call the onLogout function

        router.push("/");
      } else {
        console.error("Failed to sign out.");
      }
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-5 py-3 text-base bg-purple-600 rounded text-white hover:bg-purple-700"
    >
      Sign Out
    </button>
  );
}

export default SignOut;
