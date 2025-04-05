import React from "react";
import HotelCard from "./HotelCard";

// Hotel data for rendering hotel cards
const hotelData = [
  {
    id: 1,
    name: "Hotel Kaneyamaen and Bessho SASA",
    description:
      "Located at the base of Mount Fuji, Hotel Kaneyamaen is a traitional japanese ryokan with a modern twist. Enjoy a private onsen bath and a private multi-course kaiseki dinner.",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/371f78c94ae9ec27f97c1fa407256d8abe922f9e",
  },
  {
    id: 2,
    name: "HOTEL THE FLAG 大阪市",
    description:
      "Make a stop in Osaka and stay at HOTEL THE FLAG, just a few minutes walk to experience the food culture surrounding Dontonbori. Just one minute away is the Shinsaibashi shopping street.",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/37c6839195ccfefa9ed8f0a174c700e1c5fc0ba4",
  },
  {
    id: 3,
    name: "9 Hours Shinjuku",
    description:
      "Experience a truly unique stay in an authentic Japanese capsule hotel. 9 Hours Shinjuku is minutes from one of Japan's busiest train stations. Just take the NEX train from Narita airport!",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/98188dc21b6ad5df1553616915b400f1deaf98f6",
  },
];

const HotelSection: React.FC = () => {
  return (
    <section
      className="px-16 py-10 max-md:px-8"
      aria-labelledby="hotels-heading"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 id="hotels-heading" className="text-2xl font-bold">
          <span>Find </span>
          <span className="text-indigo-500">places to stay</span>
          <span> in Japan</span>
        </h2>
        <a
          href="#"
          className="flex gap-1 items-center text-2xl cursor-pointer text-slate-400"
          aria-label="View all places to stay"
        >
          <span>All</span>
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </div>
      <div className="flex gap-10 max-md:flex-col">
        {hotelData.map((hotel) => (
          <HotelCard key={hotel?.id} hotel={hotel} />
        ))}
      </div>
    </section>
  );
};

export default HotelSection;
