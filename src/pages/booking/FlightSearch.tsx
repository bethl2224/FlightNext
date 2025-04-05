"use client";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import FlightList from "./FlightList"
import Image from "next/image"
export interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  origin_name: string;
  dest_name: string;
  duration: string;
  layovers: string;
  status: string;
  trip_type: string;
}


interface FlightSearchProps {
  departureQuery: string;
  setDepartureQuery: React.Dispatch<React.SetStateAction<string>>;
  departureSuggestions: string[];
  setDepartureSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  arrivalQuery: string;
  setArrivalQuery: React.Dispatch<React.SetStateAction<string>>;
  arrivalSuggestions: string[];
  setArrivalSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  tripType: string;
  setTripType: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  addFlightGroupToCart: (flightGroup: Flight[]) => void;
}



const FlightSearch: React.FC<FlightSearchProps> = ({
  departureQuery,
  setDepartureQuery,
  departureSuggestions,
  setDepartureSuggestions,
  arrivalQuery,
  setArrivalQuery,
  arrivalSuggestions,
  setArrivalSuggestions,
  tripType,
  setTripType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  addFlightGroupToCart,
}) => {
  const [singleFlightData, setSingleFlightData] = useState<Flight[][]>([]); // State for flight data
  const [roundFlightData, setRoundFlightData] = useState<Flight[][]>([]); // State for round flight data
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Track if the form has been submitted
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state




  // State for hotel suggestions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelError, setHotelError] = useState("");

  // Fetch hotel suggestions
  const fetchHotels = async (query: string) => {
    setLoadingHotels(true);
    setHotelError("");
    try {
      const response = await fetch(`/api/hotel/visitor/get-hotel-city?query=${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }
      const data = await response.json();
      setHotels(data);
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      } catch (err) {
      setHotelError("Unable to fetch hotel suggestions. Please try again.");
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleHotelSuggestions = (query: string) => {
    fetchHotels(query);
    setIsModalOpen(true);
  };

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitted(true); // Mark the form as submitted

    // Validate required fields
    if (!departureQuery || !arrivalQuery || !startDate) {
      alert("Please fill in all required fields.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    // Check if departureQuery and arrivalQuery are the same
    if (departureQuery.trim().toLowerCase() === arrivalQuery.trim().toLowerCase()) {
      alert("Origin and destination cannot be the same.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

      // Validate that the start date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
  if (startDate && startDate < today) {
    alert("Departure date must be in the future.");
    setIsLoading(false); // Stop loading if validation fails
    return;
  }


     // Additional validation for "Two Way" trip type
  if (tripType === "twoway") {
    if (!endDate) {
      alert("Please select a return date for a Two Way trip.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    // Validate that the end date is in the future
    if (endDate < today) {
      alert("Return date must be in the future.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    // Validate that the return date is later than or equal to the departure date
    if (endDate < startDate) {
      alert("Return date must be later than or equal to the departure date.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }
  }
    

    const origin = departureQuery.includes(",")
      ? departureQuery.split(",")[0].trim()
      : departureQuery.trim();
    const destination = arrivalQuery.includes(",")
      ? arrivalQuery.split(",")[0].trim()
      : arrivalQuery.trim();

    const formattedStartDate = startDate?.toISOString().split("T")[0];
    const formattedEndDate = endDate?.toISOString().split("T")[0];

    const endpoint = `/api/flights/details?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&date=${formattedStartDate}&flight_type=${encodeURIComponent(
      tripType === "twoway" ? "round_trip" : tripType
    )}${tripType === "twoway" && endDate ? `&round_trip_date=${formattedEndDate}` : ""}`;


    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error fetching flight details: ${response.statusText}`);
      }
      const data = await response.json();

      interface Trip {
        flights: {
          flightNumber: string;
          departureTime: string;
          arrivalTime: string;
          id: string;
          origin: { code: string; city: string };
          destination: { code: string; city: string };
          duration: number;
          status: string;
        }[];
        layovers?: string[];
      }

      const oneWayTrips = data.results?.oneWayTrips?.map((trip: Trip) =>
        trip.flights.map((flight) => ({
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          id: flight.id,
          origin: flight.origin.code,
          origin_name: flight.origin.city,
          dest_name: flight.destination.city,
          type: "one-way",
          destination: flight.destination.code,
          duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
          layovers: trip.layovers?.join(", ") || "None",
          status: flight.status,
        }))
      );

      const roundTripFlights = data.results?.roundTrip?.map((trip: Trip) =>
        trip.flights.map((flight) => ({
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          id: flight.id,
          origin: flight.origin.code,
          type: "back-way",
          destination: flight.destination.code,
          origin_name: flight.origin.city,
          dest_name: flight.destination.city,
          duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
          layovers: trip.layovers?.join(", ") || "None",
          status: flight.status,
        }))
      );


      // const allFlights = [...(oneWayTrips || []), ...(roundTripFlights || [])];
      setSingleFlightData(oneWayTrips); // Update single flight data with all flights
      setRoundFlightData(roundTripFlights);

      
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "An unknown error occurred.");
      setSingleFlightData([]); // Update single flight data with all flights
      setRoundFlightData([]);
      setSingleFlightData([]); // Clear the flight data in case of an error

    } finally {
      setIsLoading(false); // Stop loading after the search is complete
    }
  };


  console.log(departureQuery)
  console.log(arrivalQuery)


  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-4 w-full bg-white rounded border border-solid shadow border-[#CBD4E6] px-4 py-2"
        role="search"
        aria-label="Flight search"
      >
        {/* Origin Input */}
        <div className="flex items-center gap-2 flex-1 relative">
          <input
            type="text"
            placeholder="Enter origin"
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={departureQuery}
            onChange={(e) => setDepartureQuery(e.target.value)}
          />
          {departureSuggestions && departureSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
              {departureSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDepartureQuery(suggestion);
                    setDepartureSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destination Input */}
        <div className="flex items-center gap-2 flex-1 relative">
          <input
            type="text"
            placeholder="Enter destination"
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={arrivalQuery}
            onChange={(e) => setArrivalQuery(e.target.value)}
          />
          {arrivalSuggestions && arrivalSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
              {arrivalSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setArrivalQuery(suggestion);
                    setArrivalSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Departure Date Picker */}
        <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2 flex-1">
                <i className="ti ti-calendar text-2xl text-indigo-500" aria-hidden="true" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Select departure date"
                  className="w-full text-lg border-[none] text-slate-400"
                  aria-label="Return date"
                />
              </div>
        </div>


           {/* Departure Date Picker */}
           {tripType === "twoway" && (
            <>
              <div className="flex items-center gap-2 flex-1">
                <i className="ti ti-calendar text-2xl text-indigo-500" aria-hidden="true" />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="Select return date"
                  className="w-full text-lg border-[none] text-slate-400"
                  aria-label="Return date"
                />
              </div>
            </>
          )}


{/* Trip Type Selector */}
<div className="flex items-center gap-2 flex-1">
  <i className="ti ti-exchange text-2xl text-slate-500" aria-hidden="true" />
  <select
    value={tripType}
    onChange={(e) => setTripType(e.target.value)}
    className="w-full text-lg border-[none] text-slate-400"
    aria-label="Trip type"
  >
    <option value="oneway">One Way</option>
    <option value="twoway">Two Way</option>
  </select>
</div>


        {/* Submit Button */}
        <button
          type="submit"
          className="px-5 py-3 text-lg bg-indigo-500 rounded cursor-pointer border-[none] text-neutral-50"
        >
          Search
        </button>
      </form>


       {/* Loading Indicator */}
       {isLoading && <div className="text-center text-blue-500 mt-4">Searching for flights...</div>}
 {/* Flight Results Section */}
 <section aria-labelledby="flight-results-heading" className="w-full">
        </section>
{/* Render FlightResults */}
{isSubmitted && singleFlightData && singleFlightData.length > 0 && (
  <div className="mt-6">
    <FlightList tripType={tripType} singleFlights={singleFlightData} roundFlights={roundFlightData} isLoading={isLoading} addFlightGroupToCart={addFlightGroupToCart} />
  </div>
)}


    {/* Hotel Suggestion Button */}
    <div className="mt-6">
        <button
          onClick={() => handleHotelSuggestions(arrivalQuery)}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Suggest Hotels
        </button>
      </div>

      {/* Modal */}
     {/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-3/4 max-w-lg">
      <h2 className="text-xl font-bold mb-4">Hotel Suggestions</h2>
      {loadingHotels ? (
        <p>Loading hotels...</p>
      ) : hotelError ? (
        <p className="text-red-500">{hotelError}</p>
      ) : hotels.length > 0 ? (
        <ul className="space-y-4">
          {hotels.map((hotel: { name: string; images: { url: string }[]; logo: string; location: { city: string; country: string }; address: string; starRating: number }, index: number) => (
            <li key={index} className="flex gap-4 border-b pb-4">
              {/* Hotel Image */}
              <div className="w-1/3">
              <Image
  src={hotel.images[0]?.url || hotel.logo}
  alt={hotel.name}
  className="w-24 h-24 object-cover rounded" // Adjusted width and height
  width={96} // Match the width in pixels (12 * 4 = 48px)
  height={96} // Match the height in pixels (12 * 4 = 48px)
/>
              </div>

              {/* Hotel Details */}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{hotel.name}</h3>
                <p className="text-sm text-gray-500">
                  {hotel.location.city}, {hotel.location.country}
                </p>
                <p className="text-sm">{hotel.address}</p>
                <p className="text-sm">
                  <span className="font-bold">Rating:</span> {hotel.starRating} ⭐
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hotels found for the destination location.</p>
      )}
      <button
        onClick={() => setIsModalOpen(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Close
      </button>
    </div>
  </div>
)}



    </>
  );
};

export default FlightSearch;