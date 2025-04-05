import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FlightResults from "./FlightResults";
import { validateDate } from "@/utils/hotel-query";

interface Flight {
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

interface SearchFormProps {
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
}

const SearchForm: React.FC<SearchFormProps> = ({
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
}) => {
  const [singleFlightData, setSingleFlightData] = useState<Flight[][]>([]); // State for flight data
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Track if the form has been submitted
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitted(true); // Mark the form as submitted
    // setIsLoading(true); // Start loading

    // Validate required fields
    if (!departureQuery || !arrivalQuery || !startDate) {
      alert("Please fill in all required fields.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    //     // Check if departureQuery and arrivalQuery are the same
    if (
      departureQuery.trim().toLowerCase() === arrivalQuery.trim().toLowerCase()
    ) {
      alert("Origin and destination cannot be the same.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    // Additional validation for "Two Way" trip type
    if (tripType === "twoway" && !endDate) {
      alert("Please select a return date for a Two Way trip.");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    const origin = departureQuery.includes(",")
      ? departureQuery.split(",")[0].trim()
      : departureQuery.trim();
    const destination = arrivalQuery.includes(",")
      ? arrivalQuery.split(",")[0].trim()
      : arrivalQuery.trim();

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate ? endDate.toISOString().split("T")[0] : "";

    if (!validateDate(formattedStartDate, formattedEndDate)) {
      return;
    }

    const endpoint = `/api/flights/details?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&date=${formattedStartDate}&flight_type=${encodeURIComponent(
      tripType === "twoway" ? "round_trip" : tripType
    )}${
      tripType === "twoway" && endDate
        ? `&round_trip_date=${formattedEndDate}`
        : ""
    }`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(
          `Error fetching flight details: ${response.statusText}`
        );
      }
      const data = await response.json();

      let oneWayTrips = data.results?.oneWayTrips || [];
      const roundTrips = data.results?.roundTrip || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oneWayTrips = oneWayTrips.map((trip: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trip.flights.map((flight: any) => ({
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          id: flight.id,
          origin: flight.origin.code,
          origin_name: flight.origin.city,
          dest_name: flight.destination.city,
          type: "one-way",
          destination: flight.destination.code,
          duration: `${Math.floor(flight.duration / 60)}h ${
            flight.duration % 60
          }m`,
          layovers: trip.layovers?.join(", ") || "None",
          status: flight.status,
        }))
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roundTripFlights = roundTrips.map((trip: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trip.flights.map((flight: any) => ({
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          id: flight.id,
          origin: flight.origin.code,
          type: "back-way",
          destination: flight.destination.code,
          origin_name: flight.origin.city,
          dest_name: flight.destination.city,
          duration: `${Math.floor(flight.duration / 60)}h ${
            flight.duration % 60
          }m`,
          layovers: trip.layovers?.join(", ") || "None",
          status: flight.status,
        }))
      );

      const all_flights = [...oneWayTrips, ...roundTripFlights];
      setSingleFlightData(all_flights);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === "No suitable round trips available") {
        alert(
          "No suitable round trips available. Please try different dates or locations."
        );
      } else if (err.message === "Flight details not found") {
        alert("No flight details found. Please try again.");
      } else {
        alert(err.message || "An unknown error occurred.");
      }
      setSingleFlightData([]); // Clear the flight data in case of an error
    } finally {
      setIsLoading(false); // Stop loading after the search is complete
    }
  };

  return (
    <>
      <div className="bg-white rounded border border-solid border-slate-300 shadow-md w-[1200px] max-md:w-[90%]">
        <form className="flex items-center" onSubmit={handleSubmit}>
          {/* Departure City */}
          <div className="flex flex-1 flex-col gap-2 px-3 py-2 relative">
            <i
              className="ti ti-plane-departure text-2xl text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="From where?"
              className="w-full text-lg border-[none] text-slate-400"
              aria-label="Departure city"
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

          <div className="w-px h-12 bg-slate-300" role="separator" />

          {/* Arrival City */}
          <div className="flex flex-1 flex-col gap-2 px-3 py-2 relative">
            <i
              className="ti ti-plane-arrival text-2xl text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Where to?"
              className="w-full text-lg border-[none] text-slate-400"
              aria-label="Arrival city"
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

          <div className="w-px h-12 bg-slate-300" role="separator" />

          {/* Travel Dates */}
          <div className="flex flex-1 gap-2 items-center px-3 py-2">
            <i
              className="ti ti-calendar text-2xl text-indigo-500"
              aria-hidden="true"
            />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Select departure date"
              className="w-full text-lg border-[none] text-slate-400"
              aria-label="Departure date"
            />
          </div>

          {tripType === "twoway" && (
            <>
              <div className="w-px h-12 bg-slate-300" role="separator" />
              <div className="flex flex-1 gap-2 items-center px-3 py-2">
                <i
                  className="ti ti-calendar text-2xl text-indigo-500"
                  aria-hidden="true"
                />
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

          <div className="w-px h-12 bg-slate-300" role="separator" />

          {/* Trip Type Selector */}
          <div className="flex flex-1 gap-2 items-center px-3 py-2">
            <i
              className="ti ti-exchange text-2xl text-slate-500"
              aria-hidden="true"
            />
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

          <button
            type="submit"
            className="px-5 py-3 text-lg bg-indigo-500 rounded cursor-pointer border-[none] text-neutral-50"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center text-blue-500 mt-4">
          Searching for flights...
        </div>
      )}

      {/* Render FlightResults */}
      {isSubmitted && singleFlightData.length > 0 && (
        <div className="mt-6">
          <FlightResults
            trip_type={tripType}
            flights={singleFlightData}
            isLoading={isLoading}
          />{" "}
          {/* Fixed prop passing syntax */}
        </div>
      )}
    </>
  );
};

export default SearchForm;
