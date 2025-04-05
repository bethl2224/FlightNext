import React, { useState } from "react";
import Image from "next/image";

interface DestinationProps {
  destination: {
    id: number;
    name: string | "";
    description: string | "";
    price: string;
    imageUrl: string;
  } | null;
}

const DestinationCard: React.FC<DestinationProps> = ({ destination }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track image loading state

  if (!destination) {
    return (
      <article className="flex justify-center items-center h-64 bg-gray-100 rounded-xl shadow-md">
        <p className="text-gray-500">Loading destination...</p>
      </article>
    );
  }

  return (
    <article className="overflow-hidden flex-1 bg-white rounded-xl shadow-[0_2px_4px_rgba(28,5,77,0.1),0_12px_32px_rgba(0,0,0,0.05)]">
      <div className="relative w-full h-[397px] max-sm:h-[200px]">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Loading image...</p>
          </div>
        )}
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          layout="fill"
          objectFit="cover"
          priority
          onLoadingComplete={() => setIsImageLoaded(true)} // Set loading state to true when the image is fully loaded
        />
      </div>
      <div className="px-6 py-4">
        <h3 className="mx-0 mt-0 mb-1 text-lg font-semibold text-indigo-500">
          {destination?.name}
        </h3>
        <p className="m-0 text-base text-slate-400">{destination.description}</p>
        <div className="mt-2 text-base text-slate-800">{destination.price}</div>
      </div>
      s
    </article>
  );
};

export default DestinationCard;