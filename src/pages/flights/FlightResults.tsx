import React, { useState, useEffect } from "react";
import FlightCard from "./FlightCard";

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string; // ISO string
  arrivalTime: string;
  origin: string;
  destination: string;
  origin_name: string;
  dest_name: string;
  duration: string;
  layovers: string;
  status: string;
  trip_type: string; // Added trip_type property
}

interface FlightResultsProps {
  flights?: Flight[][]; // A list of lists of flights
  single?: number; // 0 for one-way, 1 for two-way
  isLoading?: boolean; // New prop to track loading state
  itemsPerPage?: number; // Number of items per page
  trip_type?: string;
}

const FlightResults: React.FC<FlightResultsProps> = ({
  flights = [],
  single = 0,
  isLoading = false,
  itemsPerPage = 5, // Default items per page
  trip_type,
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark/light mode
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null); // Track selected route for filtering

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Persist theme in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Group flights by origin and destination
  const groupedFlights: Record<string, Flight[][]> = {};
  flights.forEach((flightList) => {
    const routeKey = `${flightList[0].origin_name}-${flightList[flightList.length - 1].dest_name}`;
    if (!groupedFlights[routeKey]) {
      groupedFlights[routeKey] = [];
    }
    groupedFlights[routeKey].push(flightList);
  });

  // Sort each group by the departure time of the first flight
  Object.keys(groupedFlights).forEach((routeKey) => {
    groupedFlights[routeKey].sort(
      (a, b) =>
        new Date(a[0].departureTime).getTime() -
        new Date(b[0].departureTime).getTime()
    );
  });

  // Get all route keys
  const routeKeys = Object.keys(groupedFlights);

  // Filter flights based on selected route
  const filteredRouteKeys = selectedRoute
    ? [selectedRoute]
    : routeKeys;

  // Calculate total pages
  const totalPages = Math.ceil(filteredRouteKeys.length / itemsPerPage);

  // Get paginated route keys
  const paginatedRouteKeys = filteredRouteKeys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="text-center text-blue-500 mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
        Searching for flights...
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} p-4`}>
      {/* Dark/Light Mode Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded-lg shadow ${
            isDarkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

       {/* Filter Tabs (Only for Two-Way Trips) */}
{trip_type === "twoway" && (
  <div className="flex gap-4 mb-6 overflow-x-auto">
    {routeKeys.map((routeKey) => (
      <button
        key={routeKey}
        onClick={() => {
          setSelectedRoute(routeKey);
          setCurrentPage(1); // Reset to the first page when a filter is applied
        }}
        className={`px-4 py-2 rounded-lg shadow ${
          selectedRoute === routeKey
            ? "bg-indigo-600 text-white"
            : isDarkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        }`}
      >
        {routeKey.split("-")[0]} → {routeKey.split("-")[1]}
      </button>
    ))}
    {selectedRoute && (
      <button
        onClick={() => {
          setSelectedRoute(null);
          setCurrentPage(1); // Reset to the first page when clearing the filter
        }}
        className={`px-4 py-2 rounded-lg shadow ${
          isDarkMode
            ? "bg-red-600 text-white hover:bg-red-500"
            : "bg-red-200 text-red-900 hover:bg-red-300"
        }`}
      >
        Clear Filter
      </button>
    )}
  </div>
)}

      {paginatedRouteKeys.map((routeKey, index) => {
        const flightGroups = groupedFlights[routeKey];

        return (
          <div key={index} className="mb-8 border-b border-gray-300 pb-6">
            <h3 className="font-bold text-2xl mb-6 text-indigo-600">
              From {routeKey.split("-")[0]} to {routeKey.split("-")[1]}
            </h3>

            {/* Display flights vertically for one-way, side by side for two-way */}
            {single === 0 ? (
              <div className="flex flex-col gap-6">
                {flightGroups.map((flightList, groupIndex) => (
                  <div
                    key={groupIndex}
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    } shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow`}
                  >
                    {flightList.map((flight, flightIndex) => (
                      <FlightCard key={flightIndex} flight={flight} isDarkMode={isDarkMode} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6">
                {flightGroups.map((flightList, groupIndex) => (
                  <div
                    key={groupIndex}
                    className={`flex-1 ${
                      isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    } shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow`}
                  >
                    {flightList.map((flight, flightIndex) => (
                      <FlightCard key={flightIndex} flight={flight} isDarkMode={isDarkMode}/>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg shadow ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isDarkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          Previous
        </button>
        <span className="text-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg shadow ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isDarkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlightResults;