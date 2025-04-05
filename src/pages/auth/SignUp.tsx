"use client";
import * as React from "react";
import AuthInput from "./AuthInput";
import { useState } from "react";
import "@pages/styles/globals.css";

function SignUp() {
  // State to store form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
  });

  // State to store success or error messages
  const [message, setMessage] = useState(""); // Message to display success or error

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSignUp = async () => {
    try {
      const response = await fetch("/api/account/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const successData = await response.json();
        setMessage(
          successData.message +
            " Sign in to FlyNext to access exclusive user features!" ||
            "Successfully signed up to FlyNext! Sign in to FlyNext to access exclusive user features!"
        );
        console.log("User signed up successfully.");
        // Clear the message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.error.includes("Username")) {
          setMessage(
            "Username already exists. Please choose another username."
          );
        } else {
          setMessage("Email already exists. Please choose another email.");
        }

        // Clear the message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to create user");

        // Clear the message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    } catch {
      setMessage("An error occurred. Please try again.");

      // Clear the message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  return (
    <section className="flex overflow-hidden flex-col px-10 pt-10 pb-40 text-lg bg-white rounded-xl border border-solid shadow-md border-[color:var(--Grey-200,#CBD4E6)] max-w-[883px] max-md:px-5 max-md:pb-24">
      <header className="flex flex-col justify-center items-center self-center pb-2 max-w-full text-2xl font-bold text-slate-500 w-[488px]">
        <div className="flex flex-wrap gap-2.5 justify-center items-center w-full max-md:max-w-full">
          <h1 className="text-center flex items-center gap-2 max-md:max-w-full max-md:text-center">
            Sign Up for FlyNext
          </h1>
        </div>
      </header>

      {/* Input fields */}
      <AuthInput
        name="firstName"
        placeholder="First Name"
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
        value={formData.firstName}
        onChange={handleChange}
      />
      <AuthInput
        name="lastName"
        placeholder="Last Name"
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
        value={formData.lastName}
        onChange={handleChange}
      />
      <AuthInput
        name="phoneNumber"
        placeholder="Phone Number"
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
        value={formData.phoneNumber}
        onChange={handleChange}
      />
      <AuthInput
        name="email"
        placeholder="Email"
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
        value={formData.email}
        onChange={handleChange}
      />
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

      {/* Submit button */}
      <button
        onClick={handleSignUp}
        className="overflow-hidden flex-1 shrink gap-2 self-stretch px-5 py-3 mt-3 w-full text-center bg-indigo-500 rounded basis-0 min-h-12 text-neutral-50 max-md:max-w-full"
      >
        Submit
      </button>

      {/* Display success or error message */}
      {message && (
        <p
          className={`mt-4 text-center text-lg font-semibold ${
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}

function SignUpModal() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className="px-5 py-3 text-base bg-indigo-500 rounded cursor-pointer border-[none] text-neutral-50"
      >
        Sign Up
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <SignUp />
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

export default SignUpModal;
