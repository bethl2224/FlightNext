import React from "react";

interface FlightProps {
  flight: {
    flightNumber: string | "";
    departureTime: string;
    arrivalTime: string;
    origin: string;
    trip_type: string;
    destination: string;
    origin_name: string;
    dest_name: string;
    duration: string;
    layovers: string;
    status: string;
  };

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
        className={`flex justify-between items-center mb-2 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
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
            Flight:
          </span>{" "}
          {flight.flightNumber}
        </div>

        {/* Time */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            Time:
          </span>{" "}
          {formatFlightDateTime(flight.departureTime)} -{" "}
          {formatFlightDateTime(flight.arrivalTime)}
        </div>

        {/* Duration */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            Duration:
          </span>{" "}
          {flight.duration}
        </div>

        {/* Layovers */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            Layovers:
          </span>{" "}
          {flight.layovers}
        </div>

        {/* Status */}
        <div className="flex-1 text-center">
          <span className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
            Status:
          </span>{" "}
          {flight.status}
        </div>
      </div>
    </article>
  );
};

export default FlightCard;