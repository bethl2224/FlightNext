"use client";

import { useRouter } from "next/navigation"; // Use next/navigation for App Router

function Hero() {
  const router = useRouter(); // Initialize the router

  // Method to navigate to /flight/FlightTravel
  const navigateToFlightTravel = () => {
    router.push("/flights/FlightTravel");
  };

  return (
    <section className="flex relative top-12 flex-col justify-center items-center p-0 h-screen bg-center bg-cover bg-[url('https://cdn.builder.io/api/v1/image/assets/TEMP/7041c782d0b5058a4f1dcf5bcb7987e7f49c1d2a')]">
      {/* Hero Title */}
      <h1 className="flex flex-col items-center mb-16 text-8xl font-extrabold text-center bg-clip-text leading-[90px] max-md:text-7xl max-sm:text-5xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          It&apos;s more than
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          just a trip
        </span>
      </h1>

      {/* Search Section */}
      <div className="flex flex-col items-center w-full max-w-4xl">
        {/* Search Prompt */}
        <p className="mb-6 text-3xl font-medium text-gray-100">
          Begin Your Search
        </p>

        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full px-8 py-6 text-xl text-gray-700 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105"
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-8 py-4 text-lg font-semibold text-white bg-purple-500 rounded-full shadow-md hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
            onClick={navigateToFlightTravel} // Call the navigation method
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;