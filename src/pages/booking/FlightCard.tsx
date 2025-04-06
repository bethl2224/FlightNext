import React, { useState } from "react";

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
    airline: { name: string; code: string };
    price: number;
    currency: string;
    availableSeats: number;
    
  };
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

const FlightCard: React.FC<FlightProps> = ({ flight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure the flight object is defined
  if (!flight) {
    return (
      <article className="flex flex-col p-4 border-b border-solid border-b-violet-100">
        <div className="text-center text-red-500">Flight data is unavailable.</div>
      </article>
    );
  }

  return (
    <>
      {/* Flight Card */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 bg-white shadow-md rounded-lg border border-gray-200">
        {/* Basic Flight Details */}
        <div className="flex flex-col gap-2 w-full md:w-2/3">
          <h3 className="text-lg font-semibold text-indigo-600">
            Flight: {flight.flightNumber}
          </h3>
          <p className="text-gray-700">
            <span className="font-medium">Airline:</span> {flight.airline.name} ({flight.airline.code})
          </p>
          <p className="text-gray-700">
            <span className="font-medium">{flight.origin_name}</span> ({flight.origin}) →{" "}
            <span className="font-medium">{flight.dest_name}</span> ({flight.destination})
          </p>
          <p className="text-gray-500">
            <span className="font-medium">Departure:</span> {formatFlightDateTime(flight.departureTime)}
          </p>
          <p className="text-gray-500">
            <span className="font-medium">Arrival:</span> {formatFlightDateTime(flight.arrivalTime)}
          </p>
          <p className="text-gray-500">
            <span className="font-medium">Duration:</span> {flight.duration}
          </p>
          <p className="text-gray-500">
            <span className="font-medium">Price:</span> ${flight.price} 
          </p>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-2 mt-4 md:mt-0 md:w-1/3">
          <button
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            onClick={() => setIsModalOpen(true)}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Modal for Full Flight Details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
              Flight Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Flight Number:</span>
                <span className="text-gray-500">{flight.flightNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Airline:</span>
                <span className="text-gray-500">
                  {flight.airline.name} ({flight.airline.code})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Origin to Destination:</span>
                <span className="text-gray-500">
                  {flight.origin_name} ({flight.origin}) → {flight.dest_name} ({flight.destination})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Departure :</span>
                <span className="text-gray-500">{formatFlightDateTime(flight.departureTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Arrival :</span>
                <span className="text-gray-500">{formatFlightDateTime(flight.arrivalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-500">{flight.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Price:</span>
                <span className="text-gray-500">
                  ${flight.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Layovers:</span>
                <span className="text-gray-500">{flight.layovers}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`text-sm font-medium ${
                    flight.status === "On Time"
                      ? "text-green-600"
                      : flight.status === "Delayed"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {flight.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlightCard;