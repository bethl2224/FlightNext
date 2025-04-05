"use client";
import React from "react";
interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star === value ? 0 : star)}
            className="text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            aria-label={`${star} stars`}
          >
            <span
              className={`${
                star <= value ? "text-yellow-500" : "text-yellow-300"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StarRating;
