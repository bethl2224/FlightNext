"use client";
import * as React from "react";
import { useRouter } from "next/navigation"; // For redirection
import "@pages/styles/globals.css";
import FlightDealsSection from "@pages/main/FlightDealsSection";
import PlacesToStaySection from "@pages/main/PlacesToStaySection";
import TestimonialsSection from "@pages/main/TestimonialsSection";
import Footer from "@pages/main/Footer";
import Header from "@pages/main/Header";
import Hero from "@pages/main/Hero";
import { useState, useEffect } from "react";

function FlightNext() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = useState<string>("visitor"); //account role

  //fetch role one time
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch(`${process.env.API_URL}/api/account/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user role");
        }
        const data = await res.json();
        const role = sessionStorage.getItem("role");
        if (data.role == "USER" && role == "user") {
          setUserRole("user");
          // a hotel owner is trying to access user page
        } else if (data.role == "HOTEL-OWNER" && role == "user") {
          setUserRole("user");
        } else {
          setUserRole("owner");
        }
      } catch {
        // then visitor, as no role is found
        setUserRole("visitor");
      }
    };
    fetchRole();
  }, [userRole]);
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${process.env.API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });

        if (!response.ok) {
          console.error("Unauthorized access. Redirecting to sign-in page...");
          router.push("/"); // Redirect to sign-in page
          return;
        }

        setLoading(false); // User is authenticated, stop loading
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/signin"); // Redirect on error
      }
    };

    checkAuthentication();
  }, [router]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <main className="overflow-hidden bg-white">
      <section className="hero-section"></section>
      <Header />
      <Hero />

      <div className="flex flex-col w-full max-md:max-w-full">
        <FlightDealsSection />
        <PlacesToStaySection />

        <button className="overflow-hidden gap-2 self-center px-5 py-3 mt-10 text-lg bg-indigo-500 rounded min-h-12 text-neutral-50">
          Explore more stays
        </button>

        <TestimonialsSection />
        <Footer />
      </div>
    </main>
  );
}

export default FlightNext;
