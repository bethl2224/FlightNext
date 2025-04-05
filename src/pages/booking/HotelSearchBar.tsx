"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
interface RoomType {
  roomType: string;
  pricePerNight: number;
  roomCapacity: number;
  amenities: string;
  availableCount: number;
}

interface HotelInfo {
  id: number;
  name: string;
  starRating: number;
  address: string;
  logo: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  originId: string;
  destinationId: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
  airline: {
    code: string;
    name: string;
  };
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
}

export interface Hotel_Room {
  id: number;
  name: string;
  starRating: number;
  address: string;
  logo: string;
  roomType: string;
  pricePerNight: number;
  roomCapacity: number;
  amenities: string;
  availableCount: number;
  checkInDate: string;
  checkOutDate: string;
}
interface HotelSearchBarProps {
  addHotelToCart: (hotel: Hotel_Room) => void;
}
const HotelSearchBar: React.FC<HotelSearchBarProps> = ({ addHotelToCart }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [origin, setOrigin] = useState<string>(""); // New state for origin
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flightSuggestions, setFlightSuggestions] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [flightError, setFlightError] = useState("");

  const handleFlightSuggestions = async (
    hotelId: number,
    origin: string,
    date: string
  ) => {
    if (!hotelId || !origin || !date) {
      alert("Missing required parameters for flight suggestions.");
      return;
    }

    // Extract the city from the origin string
    const [city] = origin.split(", "); // Split the origin into city and country, use only the city

    setLoadingFlights(true);
    setFlightError("");
    setFlightSuggestions([]);

    try {
      const apiUrl = `${
        process.env.API_URL
      }/api/bookings/user/flight-suggests?hotelId=${hotelId}&origin=${encodeURIComponent(
        city
      )}&date=${encodeURIComponent(date)}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      const data = await response.json();
      setFlightSuggestions(data.flights || []);
      setIsFlightModalOpen(true);
    } catch (error) {
      console.error("Error fetching flight suggestions:", error);
      setFlightError("Unable to fetch flight suggestions. Please try again.");
    } finally {
      setLoadingFlights(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.API_URL}/api/hotel/visitor/get-hotels-name?query=${searchQuery}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();

        const hotelSuggestions = data
          .slice(0, 5)
          .map(
            (hotel: { name: string; city: string; country: string }) =>
              `${hotel.name}, ${hotel.city}, ${hotel.country}`
          );

        setSuggestions(hotelSuggestions);
      } catch (error) {
        console.error("Error fetching hotel suggestions:", error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery || !checkInDate || !checkOutDate) {
      alert("Please fill in all fields before searching.");
      setAvailableRooms([]);
      return;
    }

    // Validate that check-in and check-out dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    if (new Date(checkInDate) < today) {
      alert("Check-in date must be in the future.");
      setAvailableRooms([]);
      return;
    }

    if (new Date(checkOutDate) < today) {
      alert("Check-out date must be in the future.");
      setAvailableRooms([]);
      return;
    }

    // Validate that check-in date is before check-out date
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert("Check-in date must be before check-out date.");
      setAvailableRooms([]);
      return;
    }

    try {
      const queryParts = searchQuery.split(", ");
      if (queryParts.length < 3) {
        alert("Please select a valid hotel from the suggestions.");
        setAvailableRooms([]);
        return;
      }

      const hotelName = queryParts[0];
      const city = queryParts[1];
      const country = queryParts[2];

      const apiUrl = `${
        process.env.API_URL
      }/api/hotel/visitor/get-hotel-search?city=${encodeURIComponent(
        city
      )}&country=${encodeURIComponent(
        country
      )}&checkInDate=${encodeURIComponent(
        checkInDate
      )}&checkOutDate=${encodeURIComponent(
        checkOutDate
      )}&hotelName=${encodeURIComponent(hotelName)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        alert("No available rooms for the specified dates");
        setAvailableRooms([]);
        return;
      }
      const data = await response.json();

      setAvailableRooms(data.availableRoomTypes || []);
      setHotelInfo({
        id: data.id,
        name: data.hotelName,
        starRating: data.starRating,
        address: data.address,
        logo: data.logo,
      });
    } catch (error) {
      console.error("Error fetching available room types:", error);
      alert("Failed to fetch available room types. Please try again.");
    }
  };

  // Autocomplete for Origin Field
  React.useEffect(() => {
    if (origin?.length > 0) {
      Promise.allSettled([
        fetch(`${process.env.API_URL}/api/flights/cities?city=${origin}`).then(
          (res) => res.json()
        ),
        fetch(
          `${process.env.API_URL}/api/flights/airports?airport=${origin}`
        ).then((res) => res.json()),
      ])
        .then((results) => {
          const cities =
            results[0].status === "fulfilled" ? results[0].value : [];
          const airports =
            results[1].status === "fulfilled" ? results[1].value : [];
          const citySuggestions = Array.isArray(cities)
            ? cities
                .slice(0, 5)
                .map(
                  ({ city, country }: { city: string; country: string }) =>
                    `${city}, ${country}`
                )
            : [];
          const airportSuggestions = Array.isArray(airports)
            ? airports.slice(0, 5).map(({ name }: { name: string }) => name)
            : [];
          setOriginSuggestions([...citySuggestions, ...airportSuggestions]);
        })
        .catch((err) =>
          console.error("Error fetching origin suggestions:", err)
        );
    } else {
      setOriginSuggestions([]);
    }
  }, [origin]);
  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded border border-gray-300 shadow-md px-4 py-4">
      {/* Search Input */}

      {/* Origin Input with Autocomplete */}
      <div className="mt-4">
        <label htmlFor="origin" className="text-sm font-medium text-gray-700">
          Where are you flying from?
        </label>
        <input
          type="text"
          id="origin"
          placeholder="Enter your origin city"
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        {originSuggestions.length > 0 && (
          <ul className="bg-white border border-gray-300 rounded shadow-md mt-2">
            {originSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setOrigin(suggestion);
                  setOriginSuggestions([]);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Input with Autocomplete */}
      <div className="mt-4">
        <label
          htmlFor="searchQuery"
          className="text-sm font-medium text-gray-700"
        >
          Search by hotel name
        </label>
        <input
          type="text"
          id="searchQuery"
          placeholder="Search by city or hotel name"
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search hotels by name"
        />
        {suggestions.length > 0 && (
          <ul className="bg-white border border-gray-300 rounded shadow-md mt-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchQuery(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Check-In and Check-Out Fields */}
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label
            htmlFor="check-in"
            className="text-sm font-medium text-gray-700"
          >
            Check-In
          </label>
          <input
            type="date"
            id="check-in"
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={checkInDate || ""}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="check-out"
            className="text-sm font-medium text-gray-700"
          >
            Check-Out
          </label>
          <input
            type="date"
            id="check-out"
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={checkOutDate || ""}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
        onClick={handleSearch}
        aria-label="Search hotels"
      >
        Search
      </button>

      {/* Display Hotel Info */}
      {hotelInfo && (
        <div className="mt-6 border border-gray-300 rounded-lg shadow-md p-4 bg-white">
          <div className="flex items-center gap-4">
            <Image
              src={hotelInfo.logo}
              alt={`${hotelInfo.name} Logo`}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600">
                {hotelInfo.name}
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">Star Rating:</span>{" "}
                {hotelInfo.starRating} stars
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span>{" "}
                {hotelInfo.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Display Available Rooms */}
      {availableRooms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Available Room Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.map((room, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition"
              >
                <h4 className="text-lg font-medium text-indigo-600">
                  {room.roomType}
                </h4>
                <p className="text-gray-700 mt-2">
                  <span className="font-semibold">Price:</span> $
                  {room.pricePerNight} per night
                </p>
                <p className="text-gray-700 mt-1">
                  <span className="font-semibold">Capacity:</span>{" "}
                  {room.roomCapacity} people
                </p>
                <p className="text-gray-700 mt-1">
                  <span className="font-semibold">Amenities:</span>{" "}
                  {room.amenities}
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  onClick={() => {
                    if (hotelInfo) {
                      const hotelRoom: Hotel_Room = {
                        id: hotelInfo.id,
                        name: hotelInfo.name,
                        starRating: hotelInfo.starRating,
                        address: hotelInfo.address,
                        logo: hotelInfo.logo,
                        roomType: room.roomType,
                        pricePerNight: room.pricePerNight,
                        roomCapacity: room.roomCapacity,
                        amenities: room.amenities,
                        availableCount: room.availableCount,
                        checkInDate: checkInDate || "",
                        checkOutDate: checkOutDate || "",
                      };
                      addHotelToCart(hotelRoom);
                    } else {
                      console.error("Hotel information is missing.");
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}

            {/* Hotel Suggestion Button */}
          </div>
        </div>
      )}

      {/* Suggest Flights Button */}
      <div className="mt-6">
        <button
          onClick={() =>
            handleFlightSuggestions(
              hotelInfo?.id || 0,
              origin,
              checkInDate || ""
            )
          }
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Suggest Flights
        </button>
      </div>

      {/* Flight Suggestions Modal */}
      {/* Flight Suggestions Modal */}
      {isFlightModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-3/4 max-w-lg relative z-50">
            <button
              onClick={() => setIsFlightModalOpen(false)}
              className="absolute top-2 right-2 px-3 py-1 bg-indigo-500 text-white rounded-full hover:bg-white-500 transition duration-200 shadow-md"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Flight Suggestions</h2>
            {loadingFlights ? (
              <p>Loading flights...</p>
            ) : flightError ? (
              <p className="text-red-500">{flightError}</p>
            ) : flightSuggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-4">
                  {flightSuggestions.map((flightGroup, groupIndex) => (
                    <li key={groupIndex} className="border-b pb-4">
                      <h3 className="font-bold text-lg mb-2">
                        Option {groupIndex + 1}
                      </h3>
                      <ul className="space-y-2">
                        {flightGroup.flights.map(
                          (flight: Flight, flightIndex: number) => (
                            <li
                              key={flightIndex}
                              className="flex flex-col gap-2 border p-4 rounded-lg bg-gray-100"
                            >
                              <div>
                                <h4 className="font-semibold text-indigo-600">
                                  Flight Number: {flight.flightNumber}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Airline:
                                  </span>{" "}
                                  {flight.airline.name} ({flight.airline.code})
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Departure:
                                  </span>{" "}
                                  {new Date(
                                    flight.departureTime
                                  ).toLocaleString()}{" "}
                                  - {flight.origin.name} ({flight.origin.code}),{" "}
                                  {flight.origin.city}, {flight.origin.country}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Arrival:
                                  </span>{" "}
                                  {new Date(
                                    flight.arrivalTime
                                  ).toLocaleString()}{" "}
                                  - {flight.destination.name} (
                                  {flight.destination.code}),{" "}
                                  {flight.destination.city},{" "}
                                  {flight.destination.country}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Duration:
                                  </span>{" "}
                                  {flight.duration} minutes
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Price:</span>{" "}
                                  {flight.price} {flight.currency}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Available Seats:
                                  </span>{" "}
                                  {flight.availableSeats}
                                </p>
                              </div>
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No flights found for the selected criteria.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSearchBar;
