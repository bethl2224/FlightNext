"use client";
import React from "react";
import FlightCard from "./FlightCard";

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
  airline: { name: string; code: string };
  price: number;
  currency: string;
  availableSeats: number;
}

interface FlightListProps {
  singleFlights: Flight[][]; // Array of flight groups
  roundFlights: Flight[][];
  isLoading: boolean; // Loading state
  addFlightGroupToCart: (flightGroup: Flight[]) => void; // Callback to add flights to the cart
  tripType: string;
  
 

}

const FlightList: React.FC<FlightListProps> = ({ singleFlights, roundFlights, isLoading, addFlightGroupToCart, tripType }) => {

  if (isLoading) {
    return (
      <div className="text-center text-blue-500 mt-4">
        Searching for flights...
      </div>
    );
  }

 // Display "No flights available" message based on trip type and flight data
 if (
  (tripType === "oneway" && (!singleFlights || singleFlights.length === 0)) ||
  (tripType === "twoway" &&
    ((!singleFlights || singleFlights.length === 0) ||
      (!roundFlights || roundFlights.length === 0)))
) {
  return (
    <div className="text-center text-gray-500 mt-4">
      No flights available. Please try a different search.
    </div>
  );
}

  return (
    <div className="flex gap-6">

      {/* Render Departure Flights Only if singleFlights is Defined */}

      {singleFlights && singleFlights.length > 0 && (
        <div className="flex-1">
          <h4>Departure Flight</h4>
          <div className="mb-6 border-b border-gray-400 pb-4 h-[400px] overflow-y-auto">
            {singleFlights.map((flightGroup, flightGroupIndex) => (
          
              <div key={flightGroupIndex} className="mb-6">
                {/* Render all flights in the group */}
                {flightGroup.map((flight, flightIndex) => (
                  <FlightCard key={flightIndex} flight={flight} />
                ))}

                {/* Add Flight Group Button */}
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                    onClick={() => addFlightGroupToCart(flightGroup)}
                  >
                    Add Flight
                  </button>
                </div>

                <div className="h-1 bg-purple-500 mt-4"></div>
              </div>

            ))}
          </div>
        </div>
      )}

      {/* Render Return Flights Only for Two-Way Trips */}
      {(roundFlights && roundFlights.length > 0) && (
        <div className="flex-1">
              <h4>Return Flight</h4>
          <div className="mb-6 border-b border-gray-400 pb-4 h-[400px] overflow-y-auto">
            {roundFlights.map((flightGroup, flightGroupIndex) => (
              
              <div key={flightGroupIndex} className="mb-6">
                {/* Render all flights in the group */}
                {flightGroup.map((flight, flightIndex) => (
                  <FlightCard key={flightIndex} flight={flight} />
                ))}

                {/* Add Flight Group Button */}
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                    onClick={() => addFlightGroupToCart(flightGroup)}
                  >
                    Add Flight
                  </button>
                </div>

                <div className="h-1 bg-purple-500 mt-4"></div>
              </div>
              
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightList;