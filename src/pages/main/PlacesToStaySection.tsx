"use client";
import React from "react";
import Image from "next/image"; // Import Next.js Image component
import PlaceToStayCard from "./PlaceToStayCard";

interface PlaceToStay {
  image: string;
  title: string;
  description: string;
}

const places: PlaceToStay[] = [
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/89f7c5b83b4f3e0a60640ab3ba279bcd14dbe35d?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    title: "Stay among the atolls in Maldives",
    description:
      "From the 2nd century AD, the islands were known as the 'Money Isles' due to the abundance of cowry shells, a currency of the early ages.",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/ae7534252e7477ed0ad2221937f11ba31245c32f?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    title: "Experience the Ourika Valley in Morocco",
    description:
      "Morocco's Hispano-Moorish architecture blends influences from Berber culture, Spain, and contemporary artistic currents in the Middle East.",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/67ff1e3d833f9e6824240798b091e40595ede248?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    title: "Live traditionally in Mongolia",
    description:
      "Traditional Mongolian yurts consists of an angled latticework of wood or bamboo for walls, ribs, and a wheel.",
  },
];

const PlacesToStaySection: React.FC = () => {
  return (
    <section className="px-16 py-10 mt-10 w-full max-md:px-5 max-md:max-w-full">
      <header className="flex flex-wrap gap-10 justify-between items-start w-full text-2xl max-md:max-w-full">
        <h2 className="font-bold bg-clip-text bg-[linear-gradient(180deg,#5CD6C0_0%,#22C3A6_100%)] text-slate-500">
          Explore unique places to stay
        </h2>
        <div className="flex gap-1 items-center text-right whitespace-nowrap text-slate-400">
          <span className="self-stretch my-auto">All</span>
          {/* Replace <img> with <Image> */}
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/a4c735de0a92a32ebd4fc3388922acba1d7ff0d2?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
            width={32} // Set width for the arrow image
            height={32} // Set height for the arrow image
            className="object-contain shrink-0 self-stretch my-auto w-8 rounded aspect-square"
            alt="Arrow right"
          />
        </div>
      </header>

      <div className="mt-6 w-full max-md:max-w-full">
        <div className="flex flex-wrap gap-10 w-full max-md:max-w-full">
          {places.map((place, index) => (
            <PlaceToStayCard
              key={index}
              image={place.image}
              title={place.title}
              description={place.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacesToStaySection;