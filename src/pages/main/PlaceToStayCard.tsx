
"use client";
import React from "react";
import Image from "next/image"; // Import Next.js Image component

interface PlaceToStayCardProps {
  image: string;
  title: string;
  description: string;
}

const PlaceToStayCard: React.FC<PlaceToStayCardProps> = ({
  image,
  title,
  description,
}) => {
  return (
    <article className="overflow-hidden flex-1 shrink bg-white rounded-xl shadow-md basis-0 min-w-60">
      {/* Replace <img> with <Image> */}
      <Image
        src={image}
        alt={title}
        width={400} // Set width for the image
        height={300} // Set height for the image
        className="object-cover w-full aspect-[1.04]"
      />
      <div className="px-6 py-4 w-full bg-white max-md:px-5">
        <div className="flex items-start w-full text-lg font-semibold text-slate-500">
          <h3 className="flex-1 shrink bg-clip-text basis-0 bg-[linear-gradient(180deg,#5CD6C0_0%,#22C3A6_100%)]">
            {title}
          </h3>
        </div>
        <p className="mt-1 text-base text-slate-400">{description}</p>
      </div>
    </article>
  );
};

export default PlaceToStayCard;
