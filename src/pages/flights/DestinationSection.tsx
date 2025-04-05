import React from "react";
import DestinationCard from "./DestinationCard";

// Destination data for rendering destination cards
const destinationData = [
  {
    id: 1,
    name: "Shanghai, China",
    description: "An international city rich in culture",
    price: "$598",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/6fe16a3d42ffff1f08d0c82a68e44eafdbbf3f71",
  },
  {
    id: 2,
    name: "Nairobi, Kenya",
    description: "Dubbed the Safari Capital of the World",
    price: "$1,248",
    imageUrl: "https://placehold.co/600x400/ffa500/ffa500",
  },
  {
    id: 3,
    name: "Seoul, South Korea",
    description: "This modern city is a traveler's dream",
    price: "$589",
    imageUrl: "https://placehold.co/600x400/ff4444/ff4444",
  },
];

const DestinationSection: React.FC = () => {
  return (
    <section
      className="px-16 py-10 max-md:px-8"
      aria-labelledby="destinations-heading"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 id="destinations-heading" className="text-2xl font-bold">
          <span>People in </span>
          <span className="text-indigo-500">San Francisco</span>
          <span> also searched for</span>
        </h2>
        <a
          href="#"
          className="flex gap-1 items-center text-2xl cursor-pointer text-slate-400"
          aria-label="View all destinations"
        >
          <span>All</span>
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </div>
      <div className="flex gap-10 max-md:flex-col">
        {destinationData.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </div>
    </section>
  );
};

export default DestinationSection;
