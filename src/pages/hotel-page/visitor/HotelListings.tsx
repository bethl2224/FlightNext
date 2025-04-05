"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import ListingsHeader from "@pages/hotel-page/ListingsHeader";
import HotelCard from "@pages/hotel-page/HotelCard";
import "@pages/styles/globals.css";
import Header from "@pages/main/Header";
import Sidebar from "@pages/hotel-page/SideBar";
import { searchHotelInfo } from "@/utils/hotel-query";
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

function HotelListings() {
  // State to track input values
  const [city, setCity] = useState("Toronto");
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
  const [star, setStar] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  // const [userRole, setUserRole] = useState<"HOTEL-OWNER" | "VISITOR" | "USER">(
  //   "VISITOR"
  // );

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const params: {
          city: string;
          checkInDate: string;
          checkOutDate: string;
          starRating?: number;
          name?: string;
          priceRangeStart?: number;
          priceRangeEnd?: number;
        } = {
          city: city,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
        };

        if (star) {
          params.starRating = star;
        }
        if (searchTerm) {
          params.name = searchTerm;
        }
        if (priceRange[0] > 0) {
          params.priceRangeStart = priceRange[0];
        }
        if (priceRange[1] < 1000) {
          params.priceRangeEnd = priceRange[1];
        }

        const hotelData: Hotel[] = (await searchHotelInfo(params)) || [];
        console.log("HOTEL*************");
        console.log(hotelData);
        console.log("HOTEL*************");

        if (!hotelData || !Array.isArray(hotelData)) {
          setHotels([]);
          return;
        }

        setHotels(hotelData);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setHotels([]); // Clear hotels on error
      }
    };

    fetchHotels(); // Invoke the fetchHotels function
  }, [city, checkInDate, checkOutDate, star, searchTerm, priceRange]); // Dependency array
  return (
    <main className="flex flex-col gap-6 items-center px-16 py-10 w-full max-md:p-8 max-sm:p-6">
      <Header />
      <ListingsHeader
        city={city}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        star={star}
        searchTerm={searchTerm}
        priceRange={priceRange}
        onCityChange={setCity}
        onCheckInDateChange={setCheckInDate}
        onCheckOutDateChange={setCheckOutDate}
        onSetHotel={setHotels}
      />

      <div className="flex w-full gap-6">
        {/* Left: Sidebar */}
        <div className="w-1/4 max-md:w-1/3 max-sm:w-full">
          <Sidebar
            city={city}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            filters={{
              searchTerm: searchTerm || "",
              priceRange: priceRange || [0, 1000],
              starRating: star || 0,
            }}
            onStarChange={setStar}
            onFilterChange={setSearchTerm}
            onPriceChange={setPriceRange}
          />
        </div>

        {/* Right: Hotel Listings */}
        <div className="w-3/4 max-md:w-2/3 max-sm:w-full">
          <section className="flex flex-col gap-10 w-full">
            <div className="grid grid-cols-1 gap-10 w-full max-md:grid-cols-2 max-sm:grid-cols-1">
              {hotels.map((hotel, index) => (
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
                  userRole="VISITOR"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default HotelListings;
