"use client";
import React from "react";
import Image from "next/image"; // Import Next.js Image component

interface FlightDealCardProps {
  image: string;
  location: string;
  city: string;
  price: string;
  description: string;
  isFeatured?: boolean;
}

const FlightDealCard: React.FC<FlightDealCardProps> = ({
  image,
  location,
  city,
  price,
  description,
  isFeatured = false,
}) => {
  return (
    <article
      className={`overflow-hidden flex-1 shrink bg-white rounded-xl shadow-md basis-0 min-w-60 ${
        isFeatured ? "w-full max-md:max-w-full" : ""
      }`}
    >
      {/* Replace <img> with <Image> */}
      <Image
        src={image}
        alt={`${location} ${city}`}
        width={isFeatured ? 800 : 400} // Set width for the image
        height={isFeatured ? 240 : 300} // Set height for the image
        className={`object-cover w-full ${
          isFeatured ? "aspect-[3.3] max-md:max-w-full" : "aspect-[1.04]"
        }`}
      />
      <div className="px-6 py-4 w-full bg-white max-md:px-5">
        <div className="flex items-start w-full text-lg font-semibold">
          <h3 className="flex-1 shrink basis-0 text-slate-500">
            {location}
            <span className="text-[rgba(96,93,236,1)]"> {city}</span>
          </h3>
          <span className="text-right text-slate-500 w-[72px]">{price}</span>
        </div>
        <p className="mt-1 text-base text-slate-400">{description}</p>
      </div>
    </article>
  );
};

export default FlightDealCard;