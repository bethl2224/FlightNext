"use client";
import {
  apiURl,
  searchHotelInfo,
  fetchHotel,
  validateDate,
} from "@utils/hotel-query";
import { useState, useEffect } from "react";
import { Hotel } from "./visitor/HotelListings";
import { fetchRoomTypes } from "@utils/hotel-query";
import Dropdown from "./owner/Filter-Label";
// Example DropDown component export

interface ListingsHeaderProps {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  star?: number;
  searchTerm?: string;
  roomType?: string;
  priceRange?: [number, number];
  onCityChange: (value: string) => void;
  onCheckInDateChange: (value: string) => void;
  onCheckOutDateChange: (value: string) => void;
  onSetHotel: (value: Hotel[]) => void;
}

function ListingsHeader({
  city,
  checkInDate,
  checkOutDate,
  star,
  searchTerm,
  priceRange,
  onCityChange,
  onCheckInDateChange,
  onCheckOutDateChange,
  onSetHotel,
}: ListingsHeaderProps) {
  const [cities, setCities] = useState<{ city: string; country: string }[]>([]); // State to store fetched cities
  const [showDropdown, setShowDropdown] = useState(false); // State to toggle dropdown visibility
  const [query, setQuery] = useState(city); // State to track the input value
  const [isLoading, setIsLoading] = useState(false); // State to show loading indicator
  const [role, setRole] = useState<string | null>("visitor"); // State to store user role
  const [roomType, setRoomType] = useState<string[] | null>(null);
  const [singleRoomType, setSingleRoomType] = useState<string | null>(null);
  useEffect(() => {
    const fetchRoomTypesAsync = async () => {
      // further validate to ensure user / owner login in
      const res = await fetch("/api/account/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });
      if (!res.ok) {
        setRole("visitor");
        return;
      }
      const userRole = sessionStorage.getItem("role");

      if (userRole == "owner") {
        console.log("fetch room types");
        const roomTypes = await fetchRoomTypes();

        roomTypes.push("All");
        setRoomType(roomTypes);
      }
      setRole(userRole);
    };

    fetchRoomTypesAsync();

    console.log("initial room type", singleRoomType);
  }, [singleRoomType]);

  //fetch role one time
  useEffect(() => {
    const fetchRole = async () => {
      const role = sessionStorage.getItem("role");
      console.log("ROLE**************");
      console.log(role);
      console.log("ROLE**************");
    };

    fetchRole();
  }, []);
  // Fetch cities from the API
  useEffect(() => {
    if (!query) {
      setCities([]); // Clear cities if query is empty
      setShowDropdown(false);

      return;
    }

    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ city: query });
        console.log(params);
        const response = await fetch(`/api/flights/cities?${params}`);
        if (response.ok) {
          const data = await response.json();
          setCities(data); // Update cities state
          setShowDropdown(true); // Show dropdown
        } else {
          setCities([]); // Clear cities if no results
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchCities();
    }, 300); // Wait 300ms before making the API call

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount or query change
  }, [query]);

  return (
    <header className="pt-14 mt-10 flex justify-between items-start w-full">
      <h1 className="text-2xl font-bold">
        <span className="text-slate-500">Find </span>
        <span className="text-indigo-500">places to stay </span>
        <span className="text-slate-500">in comfort ➡</span>
      </h1>
      <div className="flex flex-1 gap-4 items-center justify-end max-md:flex-wrap">
        {/* City Input */}
        <div className="relative">
          <label className="block text-sm text-slate-500 mb-1">City</label>
          <input
            type="text"
            placeholder="Enter city"
            value={query}
            // onFocus={() => setShowDropdown(true)} // Show dropdown on focus
            // onBlur={() => setShowDropdown(false)} // Hide dropdown on blur
            onChange={(e) => setQuery(e.target.value)} // Update query state
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="City"
          />

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
              ) : cities.length > 0 ? (
                cities.map((cityObj, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onCityChange(cityObj.city); // Update the city field
                      setQuery(cityObj.city); // Update the input value
                      setShowDropdown(false); // Hide the dropdown
                    }}
                    className="p-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    {cityObj.city}, {cityObj.country}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>
        {/* Check-In-Date Input */}
        <div className="relative">
          <label className="block text-sm text-slate-500 mb-1">
            Check-In-Date
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInDateChange(e.target.value)} // Update state on input
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Check-in date"
          />
        </div>
        {/* Check-Out-Date Input */}
        <div className="relative">
          <label className="block text-sm text-slate-500 mb-1">
            Check-Out-Date
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutDateChange(e.target.value)} // Update state on input
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Check-out date"
          />
        </div>
        {role == "owner" && (
          <div className="relative">
            <label className="block text-sm text-slate-500 mb-1">Filter</label>
            {/*filter by hotelType */}

            <Dropdown
              options={roomType || []}
              onSelect={setSingleRoomType}
              onSetHotel={onSetHotel}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
            />
          </div>
        )}
        {/* Search Button */}
        <button
          onClick={async () => {
            const params: {
              city?: string;
              checkInDate: string;
              checkOutDate: string;
              starRating?: number;
              name?: string;
              priceRangeStart?: number;
              priceRangeEnd?: number;
            } = { checkInDate, checkOutDate };

            if (city) {
              params.city = city;
            }

            //validate date

            validateDate(checkInDate, checkOutDate);

            // Pass in optional parameters
            if (star) {
              params.starRating = star;
            }
            if (searchTerm) {
              params.name = searchTerm;
            }
            if (Array.isArray(priceRange) && priceRange.length === 2) {
              if (priceRange[0] > 0) {
                params.priceRangeStart = priceRange[0];
              }
              if (priceRange[1] < 1000) {
                params.priceRangeEnd = priceRange[1];
              }
            }

            // Debug the params object
            console.log("Search Parameters:", params);

            const role = sessionStorage.getItem("role");
            console.log("ROLE**************");
            console.log(role);
            console.log("ROLE**************");

            if (role === "owner") {
              if (city == "") {
                const response = await fetchHotel();
                const hoteData: Hotel[] =
                  response && response.ok ? await response.json() : [];
                onSetHotel(hoteData);
              } else {
                const hotelData: Hotel[] =
                  (await searchHotelInfo(params, role)) || []; // Fetch hotel data
                onSetHotel(hotelData); // Update the hotel state

                //if hotel name exists, clear city
                setQuery("");
                onCityChange("");
              }
            } else {
              const hotelData: Hotel[] = (await searchHotelInfo(params)) || []; // Fetch hotel data
              onSetHotel(hotelData); // Update the hotel state

              setQuery(city);
              onCityChange(city); // keep city persistent
            }
          }} // Handle form submission
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 self-end"
          aria-label="Search hotels"
        >
          Search
        </button>
      </div>
    </header>
  );
}

export default ListingsHeader;
