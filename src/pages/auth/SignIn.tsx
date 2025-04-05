"use client";
import * as React from "react";
import AuthInput from "./AuthInput";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import "@pages/styles/globals.css";

function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user", // Add role property with a default value
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize the router for redirection

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");

    try {
      console.log("Signing in with:", formData);
      const response = await fetch(`${process.env.API_URL}/api/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Pass username and password
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        setMessage("Sign in successful!");
        const prevRole = formData.role;
        setFormData({ username: "", password: "", role: "user" }); // Clear form

        // Redirect to /user/Home after successful sign-in
        router.push(`/${prevRole}/Home`);
        sessionStorage.setItem("role", prevRole);
      } else {
        const errorData = await response.json();
        sessionStorage.setItem("role", "visitor");
        setMessage(errorData.error || "Sign in failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      sessionStorage.setItem("role", "visitor");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex overflow-hidden flex-col px-10 pt-10 pb-40 text-lg bg-white rounded-xl border border-solid shadow-md border-[color:var(--Grey-200,#CBD4E6)] max-w-[883px] max-md:px-5 max-md:pb-24">
      <header className="flex flex-col justify-center items-center self-center pb-2 max-w-full text-2xl font-bold text-slate-500 w-[488px]">
        <div className="flex flex-wrap gap-2.5 justify-center items-center w-full max-md:max-w-full">
          <h1 className="text-center flex items-center gap-2 max-md:max-w-full max-md:text-center">
            Sign in for FlyNext
          </h1>
        </div>
      </header>

      {/* Input fields */}
      <AuthInput
        name="username"
        placeholder="Username"
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
        value={formData.username}
        onChange={handleChange}
      />

      <AuthInput
        name="password"
        placeholder="Password"
        type="password"
        className="mt-3 w-full whitespace-nowrap text-slate-400 max-md:max-w-full"
        value={formData.password}
        onChange={handleChange}
      />
      {/* Toggle button for user or hotel owner */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setFormData((prev) => ({ ...prev, role: "user" }))}
          className={`px-4 py-2 rounded-l ${
            formData.role === "user"
              ? "bg-indigo-500 text-white"
              : "bg-gray-200"
          }`}
        >
          User
        </button>
        <button
          onClick={() => setFormData((prev) => ({ ...prev, role: "owner" }))}
          className={`px-4 py-2 rounded-r ${
            formData.role === "owner"
              ? "bg-indigo-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Hotel Owner
        </button>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSignIn}
        className={`overflow-hidden flex-1 shrink gap-2 self-stretch px-5 py-3 mt-3 w-full text-center bg-indigo-500 rounded basis-0 min-h-12 text-neutral-50 max-md:max-w-full ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Display success or error message */}
      {message && (
        <p
          className={`mt-4 text-center text-lg font-semibold ${
            message.includes("successful") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}

function SignInModal() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className="p-2.5 text-base no-underline text-slate-400"
      >
        Sign In
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <SignIn />
            <button
              onClick={toggleModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SignInModal;
