"use client";
import React from "react";
import Image from "next/image"; // Import Next.js Image component
import FlightDealCard from "./FlightDealCard";

interface FlightDeal {
  image: string;
  location: string;
  city: string;
  price: string;
  description: string;
}

const regularDeals: FlightDeal[] = [
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/900c0d13547c5acdea97539f6ccbae34cc03e4a8?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    location: "The Bund,",
    city: "Shanghai",
    price: "$598",
    description: "China's most international city",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/2a7d02cdf682c61d69d2426fce46250092f890f2?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    location: "Sydney Opera House,",
    city: "Sydney",
    price: "$981",
    description: "Take a stroll along the famous harbor",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/6758d1b0fcfb30c8c9e2547f8c639a2b43a9be7a?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    location: "Kōdaiji Temple,",
    city: "Kyoto",
    price: "$633",
    description: "Step back in time in the Gion district",
  },
];

const featuredDeal: FlightDeal = {
  image:
    "https://cdn.builder.io/api/v1/image/assets/TEMP/1f06ff3b373082be5726aef37fa7ca53e4125067?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
  location: "Tsavo East National Park,",
  city: "Kenya",
  price: "$1,248",
  description:
    "Named after the Tsavo River, and opened in April 1984, Tsavo East National Park is one of the oldest parks in Kenya. It is located in the semi-arid Taru Desert.",
};

const FlightDealsSection: React.FC = () => {
  return (
    <section className="px-16 py-10 w-full max-md:px-5 max-md:max-w-full">
      <header className="flex flex-wrap gap-10 justify-between items-start w-full text-2xl max-md:max-w-full">
        <h2 className="font-bold text-slate-500 max-md:max-w-full">
          Find your next adventure with these{" "}
          <span className="text-[rgba(96,93,236,1)]">flight deals</span>
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
          {regularDeals.map((deal, index) => (
            <FlightDealCard
              key={index}
              image={deal.image}
              location={deal.location}
              city={deal.city}
              price={deal.price}
              description={deal.description}
            />
          ))}
        </div>

        <div className="flex gap-10 mt-10 w-full max-md:max-w-full">
          <FlightDealCard
            image={featuredDeal.image}
            location={featuredDeal.location}
            city={featuredDeal.city}
            price={featuredDeal.price}
            description={featuredDeal.description}
            isFeatured={true}
          />
        </div>
      </div>
    </section>
  );
};

export default FlightDealsSection;
