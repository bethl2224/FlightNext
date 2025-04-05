import React from "react";
import Image from "next/image"
interface HotelProps {
  hotel: {
    id: number;
    name: string | "";
    description: string;
    imageUrl: string | "";
  };
}

const HotelCard: React.FC<HotelProps> = ({ hotel }) => {
  return (
    <article className="overflow-hidden flex-1 bg-white rounded-xl shadow-[0_2px_4px_rgba(28,5,77,0.1),0_12px_32px_rgba(0,0,0,0.05)]">
      <Image
          src={hotel?.imageUrl}
          alt={hotel?.name}
          width={600} // Set the width of the image
          height={400} // Set the height of the image
          objectFit="cover" // Ensures the image maintains its aspect ratio
          priority // Optional: Improves LCP by prioritizing this image for loading
        />
      <div className="px-6 py-4">
        <h3 className="mx-0 mt-0 mb-1 text-lg font-semibold text-indigo-500">
          {hotel?.name}
        </h3>
        <p className="m-0 text-base text-slate-400">{hotel?.description}</p>
      </div>
    </article>
  );
};

export default HotelCard;
