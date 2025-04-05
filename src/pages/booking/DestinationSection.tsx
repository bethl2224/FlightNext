"use client";
import * as React from "react";
import DestinationCard from "./DestinationCard";
const DestinationSection: React.FC = () => {
  const destinations = [
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/175ea169eb60cdfa98126a3fc4c252cd802566df?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
      city: "Shanghai",
      country: "China",
      price: "$598",
      description: "An international city rich in culture",
      highlight: "none" as const,
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/13ca6d582bc6b6925e1c0726a1a2f566752eb00c?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
      city: "Nairobi",
      country: "Kenya",
      price: "$1,248",
      description: "Dubbed the Safari Capital of the World",
      highlight: "none" as const,
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3a5d4acfb9cfe36e394fd49300177d0a87053adb?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
      city: "Seoul",
      country: "South Korea",
      price: "$589",
      description: "This modern city is a traveler's dream",
      highlight: "country" as const,
    },
  ];

  return (
    <section
      className="px-16 py-10 w-full max-md:px-5 max-md:max-w-full"
      aria-labelledby="destination-section-title"
    >
      <div className="flex flex-wrap gap-10 justify-between items-start w-full text-2xl max-md:max-w-full">
        <h2
          id="destination-section-title"
          className="font-bold text-slate-500 max-md:max-w-full"
        >
          People in <span className="text-indigo-500">San Francisco</span> also
          searched for
        </h2>
        <a
          href="#all-destinations"
          className="flex gap-1 items-center text-right whitespace-nowrap text-slate-400"
          aria-label="View all destinations"
        >
        </a>
      </div>
      <div className="mt-6 w-full max-md:max-w-full">
        <div className="flex flex-wrap gap-10 w-full max-md:max-w-full">
          {destinations.map((destination, index) => (
            <DestinationCard key={index} {...destination} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationSection;
