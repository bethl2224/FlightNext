"use client";
import * as React from "react";
import FlightDealsSection from "@pages/main/FlightDealsSection";
import PlacesToStaySection from "@pages/main/PlacesToStaySection";
import TestimonialsSection from "@pages/main/TestimonialsSection";
import Footer from "@pages/main/Footer";
import Header from "@pages/main/Header";
import Hero from "@pages/main/Hero";



function FlightNext() {
  console.log("MainPage is rendering");
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
