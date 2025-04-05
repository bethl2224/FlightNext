"use client";
import * as React from "react";
import Image from "next/image";
interface DestinationCardProps {
  image: string;
  city: string;
  country: string;
  price: string;
  description: string;
  highlight?: "city" | "country" | "none";
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  image,
  city,
  country,
  price,
  description,
  highlight = "none",
}) => {
  return (
    <article className="overflow-hidden flex-1 shrink bg-white rounded-xl shadow-md basis-0 min-w-60">
      <Image
        src={image}
        alt={`${city}, ${country}`}
        className="object-contain w-full aspect-[1.04]"
        width={120}
        height={120} 
      />
      <div className="px-6 py-4 w-full bg-white max-md:px-5">
        <div className="flex items-start w-full text-lg font-semibold">
          <h3 className="flex-1 shrink basis-0">
            {highlight === "city" ? (
              <span className="text-indigo-500">{city}, </span>
            ) : (
              <span className="text-slate-500">{city}, </span>
            )}
            {highlight === "country" ? (
              <span className="text-indigo-500">{country}</span>
            ) : (
              <span>{country}</span>
            )}
          </h3>
          <p className="text-right text-slate-500 w-[72px]">{price}</p>
        </div>
        <p className="mt-1 text-base text-slate-400">{description}</p>
      </div>
    </article>
  );
};

export default DestinationCard;
