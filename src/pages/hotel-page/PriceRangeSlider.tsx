"use client";
import React, { useState, useEffect, useCallback } from "react";

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  formatPrice?: (price: number) => string;
}

function PriceRangeSlider({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
  formatPrice = (price) => `$${price}`,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>([min, max]);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Ensure values stay within bounds
  const clamp = useCallback(
    (val: number) => Math.min(Math.max(val, min), max),
    [min, max]
  );

  // Handle slider thumb movement
  const handleChange = useCallback(
    (newValue: number, type: "min" | "max") => {
      const clampedValue = clamp(newValue);
      let newRange: [number, number];

      if (type === "min") {
        newRange = [
          Math.min(clampedValue, localValue[1] - step),
          localValue[1],
        ];
      } else {
        newRange = [
          localValue[0],
          Math.max(clampedValue, localValue[0] + step),
        ];
      }

      setLocalValue(newRange);
      onChange(newRange);
    },
    [localValue, step, clamp, onChange]
  );

  // Calculate percentage for slider positioning
  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(localValue[0])}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(localValue[1])}
        </div>
      </div>

      <div className="relative h-2 w-full">
        {/* Track background */}
        <div className="absolute h-full w-full rounded-full bg-gray-200" />

        {/* Selected range */}
        <div
          className="absolute h-full rounded-full bg-indigo-500"
          style={{
            left: `${getPercent(localValue[0])}%`,
            width: `${getPercent(localValue[1]) - getPercent(localValue[0])}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          value={localValue[0]}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleChange(Number(e.target.value), "min")}
          onMouseDown={() => setIsDragging("min")}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging("min")}
          onTouchEnd={() => setIsDragging(null)}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none"
          style={{
            WebkitAppearance: "none",
            zIndex: isDragging === "min" ? 3 : 2,
          }}
        />

        {/* Max thumb */}
        <input
          type="range"
          value={localValue[1]}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleChange(Number(e.target.value), "max")}
          onMouseDown={() => setIsDragging("max")}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging("max")}
          onTouchEnd={() => setIsDragging(null)}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none"
          style={{
            WebkitAppearance: "none",
            zIndex: isDragging === "max" ? 3 : 2,
          }}
        />

        {/* Thumb styles */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            border: 2px solid #6366f1;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          }

          input[type="range"]::-moz-range-thumb {
            pointer-events: all;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            border: 2px solid #6366f1;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            background-color: #6366f1;
          }

          input[type="range"]::-moz-range-thumb:hover {
            background-color: #6366f1;
          }

          input[type="range"]::-webkit-slider-thumb:active {
            transform: scale(1.2);
          }

          input[type="range"]::-moz-range-thumb:active {
            transform: scale(1.2);
          }
        `}</style>
      </div>

      {/* Price input fields for direct entry */}
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <input
            type="number"
            value={localValue[0]}
            min={min}
            max={localValue[1] - step}
            step={step}
            onChange={(e) => handleChange(Number(e.target.value), "min")}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Minimum price"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            value={localValue[1]}
            min={localValue[0] + step}
            max={max}
            step={step}
            onChange={(e) => handleChange(Number(e.target.value), "max")}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Maximum price"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceRangeSlider;
