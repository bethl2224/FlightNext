import React from "react";
import {Flight} from '../booking/FlightList'
interface FlightProps {
  flight: Flight

  isDarkMode?: boolean; // Prop to track dark mode
}

// Helper function to format the date and time
const formatFlightDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const FlightCard: React.FC<FlightProps> = ({ flight, isDarkMode}) => {
  // Ensure the flight object is defined
  if (!flight) {
    return (
      <article className="flex flex-col p-4 border-b border-solid border-b-violet-100">
        <div className="text-center text-red-500">Flight data is unavailable.</div>
      </article>
    );
  }

  console.log(isDarkMode)

  return (
    <article
      className={`flex flex-col p-4 border-b border-solid ${
        isDarkMode ? "border-b-gray-700" : "border-b-violet-100"
      }`}
      data-flight-id={flight?.flightNumber}
    >
      <div
        className={`grid grid-cols-8 gap-2 items-center mb-2 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >

            {/* Route */}
            <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            {flight.airline.name} ({flight.airline.code})
          </span>
        </div>
        {/* Route */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            {flight.origin_name} → {flight.dest_name}
          </span>
          <div
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            {flight.origin} → {flight.destination}
          </div>
        </div>

        {/* Flight Number */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          {flight.flightNumber}
          </span>
        </div>

        {/* Time */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          </span>{" "}
          {formatFlightDateTime(flight.departureTime)} -{" "}
          {formatFlightDateTime(flight.arrivalTime)}
        </div>

        {/* Duration */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          </span>{" "}
          {flight.duration}
        </div>

        {/* Layovers */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          </span>{" "}
          {flight.layovers}
        </div>
          {/* Status */}
          <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          </span>{" "}
          {flight.status}
        </div>

        {/* Price */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
          </span>{" "}
          {flight.price} {flight.currency}
        </div>
      </div>
    </article>
  );
};

export default FlightCard;