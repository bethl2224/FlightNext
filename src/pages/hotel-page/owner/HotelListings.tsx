"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import ListingsHeader from "@pages/hotel-page/ListingsHeader";
import HotelCard from "@pages/hotel-page/HotelCard";
import "@pages/styles/globals.css";
import Image from "next/image";
import Header from "@pages/main/Header";
import { fetchHotel } from "@/utils/hotel-query";
import CreateRoomType from "@pages/hotel-page/owner/CreateRoomType";
// import Sidebar from "@pages/hotel-page/SideBar";

export interface Hotel {
  images: string[]; // Array of image URLs
  name: string; // Name of the hotel
  city: string; // City where the hotel is located
  country: string; // Country where the hotel is located
  altText: string; // Alternative text for the images
  roomTypes: RoomType[]; // Array of room types
  hotelId: number;
  starRating: number; // Star rating of the hotel
  address: string; // Address of the hotel
  logo: string; // Logo of the hotel
  startingPrice: number; // Starting price for the hotel (calculated as the minimum price)
}

export interface RoomType {
  roomType: string; // Type of room
  pricePerNight: number; // Price per night for the room
  numRoomAvailable: number; // Number of rooms available for this room type
  amenities: string; // Array of amenities
  roomTypeImages: string[]; // Array of image URLs
}
export interface HotelWithoutImages {
  name: string; // Name of the hotel
  hotelId: number; // Unique identifier for the hotel
  starRating: number; // Star rating of the hotel
  logo: string; // Logo of the hotel
  address: string; // Address of the hotel
  city: string; // City where the hotel is located
  country: string; // Country where the hotel is located
  images: string[]; // Array of image URLs
}

function HotelListings() {
  // State to track input values
  const [city, setCity] = useState("");
  const [userRole, setUserRole] = useState<string>("visitor");
  const [HotelNoImg, setHotelNonImage] = useState<HotelWithoutImages[]>([]); // State to store hotels without images
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    // Initialize with today's date in YYYY-MM-DD format
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  });

  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7); // Add 7 days to today's date
    return `${oneWeekLater.getFullYear()}-${(oneWeekLater.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${oneWeekLater.getDate().toString().padStart(2, "0")}`;
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);

  // optional params
  // const [star, setStar] = useState(0);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetchHotel();
        const data = res ? await res.json() : null;
        if (data) {
          setHotels(data[0]);
          setHotelNonImage(data[1]);
        } else {
          console.error("Error: Expected an array of hotels");
          setHotels([]); // Clear hotels on error
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setHotels([]); // Clear hotels on error
      }
    };
    const role = sessionStorage.getItem("role") || "visitor";
    setUserRole(role);

    fetchHotels(); // Invoke the fetchHotels function
  }, []); // Dependency array
  return (
    <main className="flex flex-col gap-6 items-center px-16 py-10 w-full max-md:p-8 max-sm:p-6">
      <div className="w-full pb-6">
        {" "}
        {/* Added padding-bottom for spacing */}
        <Header />
      </div>

      <ListingsHeader
        city={city}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        // star={star}
        // searchTerm={searchTerm}
        // priceRange={priceRange}
        onCityChange={setCity}
        onCheckInDateChange={setCheckInDate}
        onCheckOutDateChange={setCheckOutDate}
        onSetHotel={setHotels}
      />

      {/* Button to fetch and reset hotels */}
      {userRole === "owner" && (
        <div className="w-full flex justify-end">
          <button
            onClick={async () => {
              try {
                const res = await fetchHotel();
                const data = res ? await res.json() : null;
                if (data) {
                  setHotels(data[0]);
                  setHotelNonImage(data[1]);
                } else {
                  console.error("Error: Expected an array of hotels");
                  setHotels([]);
                  setHotelNonImage([]);
                }
              } catch (error) {
                console.error("Error fetching hotels:", error);
                setHotels([]);
                setHotelNonImage([]);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Refresh Listings
          </button>
        </div>
      )}
      {/* Right: Hotel Listings */}
      <div className="w-3/4 max-md:w-2/3 max-sm:w-full">
        <section className="flex flex-col gap-10 w-full">
          <div className="grid grid-cols-1 gap-10 w-full max-md:grid-cols-2 max-sm:grid-cols-1">
            {Array.isArray(hotels) &&
              hotels
                .filter((hotel) => hotel.logo)
                .map((hotel, index) => (
                  <HotelCard
                    key={`${hotel.hotelId}-${index}`}
                    images={hotel.images}
                    logo={hotel.logo}
                    starRating={hotel.starRating}
                    address={hotel.address}
                    title={hotel.name}
                    roomTypes={hotel.roomTypes}
                    startingPrice={hotel.startingPrice} // todo to add starting price
                    description={hotel.city + ", " + hotel.country}
                    altText={hotel.altText}
                    hotelId={hotel.hotelId}
                    userRole="HOTEL-OWNER"
                  />
                ))}
          </div>
        </section>
      </div>
      {/* </div> */}

      {/* Non-Hotel Listings */}
      <div className="w-3/4 max-md:w-2/3 max-sm:w-full">
        <section className="flex flex-col gap-10 w-full">
          <h2 className="text-2xl font-semibold">Other Listings</h2>
          <div className="grid grid-cols-1 gap-10 w-full max-md:grid-cols-2 max-sm:grid-cols-1">
            {HotelNoImg.map((hotel, index) => (
              <div
                key={`${hotel.hotelId}-${index}`}
                className="flex flex-col items-start p-4 border rounded-lg shadow-md relative"
              >
                <Image
                  src={hotel.logo}
                  alt={`${hotel.name} logo`}
                  width={64} // Adjust width as needed
                  height={64} // Adjust height as needed
                  className="object-cover mb-4 rounded-lg shadow-sm"
                />

                {hotel.images && hotel.images.length > 0 && (
                  <Image
                    src={hotel.images[0]}
                    alt={`${hotel.name} image`}
                    width={128} // Adjust width as needed
                    height={128} // Adjust height as needed
                    className="object-cover mb-4 rounded-lg shadow-sm"
                  />
                )}

                <h3 className="text-lg font-bold">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.address}</p>
                <p className="text-sm text-gray-600">
                  {hotel.city}, {hotel.country}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(hotel.starRating)}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {hotel.starRating} Stars
                  </span>
                </div>
                {userRole == "owner" && (
                  <div className="absolute top-4 right-4">
                    <CreateRoomType hotelId={hotel.hotelId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default HotelListings;
