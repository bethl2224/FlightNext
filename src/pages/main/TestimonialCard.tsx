"use client";
import React from "react";
import Image from "next/image"; // Import Next.js Image component

interface TestimonialCardProps {
  avatar: string;
  name: string;
  location: string;
  date: string;
  review: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  avatar,
  name,
  location,
  date,
  review,
}) => {
  // Log the props to verify their values
  console.log("TestimonialCard props:", { avatar, name, location, date, review });
  return (
    <article className="flex flex-1 shrink gap-4 items-start p-4 basis-0 min-w-60">
      {/* Replace <img> with <Image> for avatar */}
      <Image
        src={avatar}
        className="object-contain shrink-0 w-12 rounded-full aspect-square"
        alt={name}
        width={48} // Set width for the avatar
        height={48} // Set height for the avatar
      />
      <div className="flex-1 shrink basis-0 min-w-60">
        <div className="flex flex-col w-full">
          <h3 className="text-lg font-semibold text-slate-500">{name}</h3>
          <p className="text-lg text-slate-500">
            {location} <span className="text-[rgba(161,176,204,1)]">|</span>{" "}
            {date}
          </p>
        </div>
        <p className="mt-3 text-lg text-slate-800">
          {review}{" "}
          <span className="text-[rgba(96,93,236,1)]">read more...</span>
        </p>
      </div>
    </article>
  );
};

export default TestimonialCard;