"use client";
import * as React from "react";
import Image from "next/image";
interface HotelCardProps {
  image: string;
  title: string;
  description: string;
}

const HotelCard: React.FC<HotelCardProps> = ({ image, title, description }) => {
  return (
    <article className="overflow-hidden flex-1 shrink bg-white rounded-xl shadow-md basis-0 min-w-60">
      <Image
        src={image}
        alt={title}
        className="object-contain w-full aspect-[1.04]"
        width={40}
        height={40}
      />
      <div className="px-6 py-4 w-full bg-white max-md:px-5">
        <h3 className="flex-1 shrink w-full text-lg font-semibold text-indigo-500 basis-0">
          {title}
        </h3>
        <p className="mt-1 text-base text-slate-400">{description}</p>
      </div>
    </article>
  );
};

export default HotelCard;
