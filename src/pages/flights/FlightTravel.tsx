"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation"; // For Next.js
import Header from "@pages/main/Header";
import SearchForm from "./SeachForm";
import FlightResults from "./FlightResults";
import MapVisualization from "./MapVisualization";
import HotelSection from "./HotelSection";
import DestinationSection from "./DestinationSection";
import Footer from "@pages/main/Footer";
import "@pages/styles/globals.css";

const TripmaTravel: React.FC = () => {
  const searchParams = useSearchParams(); // Get search parameters from the URL

  // State for form fields
  const [tripType, setTripType] = React.useState(
    searchParams?.get("flight_type") || "oneway"
  );
  const [startDate, setStartDate] = React.useState<Date | null>(
    searchParams && searchParams.get("date")
      ? new Date(searchParams.get("date")!)
      : null
  );
  const [endDate, setEndDate] = React.useState<Date | null>(
    searchParams && searchParams.get("round_trip_date")
      ? new Date(searchParams.get("round_trip_date")!)
      : null
  );
  const [departureQuery, setDepartureQuery] = React.useState(
    searchParams?.get("origin") || ""
  );
  const [arrivalQuery, setArrivalQuery] = React.useState(
    searchParams?.get("destination") || ""
  );
  const [departureSuggestions, setDepartureSuggestions] = React.useState<
    string[]
  >([]);
  const [arrivalSuggestions, setArrivalSuggestions] = React.useState<string[]>(
    []
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flightData, setFlightData] = React.useState<any[]>([]); // State to store fetched flight data
  const [isLoading, setIsLoading] = React.useState(false); // Loading state

  // Function to fetch flight data dynamically
  const fetchFlightData = React.useCallback(async () => {
    setIsLoading(true);

    const origin = departureQuery.includes(",")
      ? departureQuery.split(",")[0].trim()
      : departureQuery.trim();
    const destination = arrivalQuery.includes(",")
      ? arrivalQuery.split(",")[0].trim()
      : arrivalQuery.trim();
    const formattedStartDate = startDate?.toISOString().split("T")[0];
    const formattedEndDate = endDate ? endDate.toISOString().split("T")[0] : "";

    const endpoint = `${
      process.env.API_URL
    }/api/flights/details?origin=${encodeURIComponent(
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
      if (data.results.length === 0) {
        alert("No Flights Found...");
        setFlightData([]);
      } else {
        setFlightData(data.results || []);
      }
    } catch {
      setFlightData([]);
    } finally {
      setIsLoading(false);
    }
  }, [departureQuery, arrivalQuery, startDate, endDate, tripType]);

  // Trigger fetch when all required fields are filled or search params are not empty
  React.useEffect(() => {
    if (tripType === "oneway" && departureQuery && arrivalQuery && startDate) {
      fetchFlightData();
    } else if (
      tripType === "twoway" &&
      departureQuery &&
      arrivalQuery &&
      startDate &&
      endDate
    ) {
      fetchFlightData();
    }
  }, [
    departureQuery,
    arrivalQuery,
    startDate,
    endDate,
    tripType,
    fetchFlightData,
  ]);

  // Fetch suggestions for arrivalQuery
  React.useEffect(() => {
    if (arrivalQuery?.length > 0) {
      Promise.allSettled([
        fetch(
          `${process.env.API_URL}/api/flights/cities?city=${arrivalQuery}`
        ).then((res) => res.json()),
        fetch(
          `${process.env.API_URL}/api/flights/airports?airport=${arrivalQuery}`
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
                .map(({ city, country }) => `${city}, ${country}`)
            : [];
          const airportSuggestions = Array.isArray(airports)
            ? airports.slice(0, 5).map(({ name }) => name)
            : [];
          setArrivalSuggestions([...citySuggestions, ...airportSuggestions]);
        })
        .catch((err) =>
          console.error("Error fetching arrival suggestions:", err)
        );
    } else {
      setArrivalSuggestions([]);
    }
  }, [arrivalQuery]);

  // Fetch suggestions for departureQuery
  React.useEffect(() => {
    if (departureQuery.length > 0) {
      Promise.allSettled([
        fetch(
          `${process.env.API_URL}/api/flights/cities?city=${departureQuery}`
        ).then((res) => res.json()),
        fetch(
          `${process.env.API_URL}/api/flights/airports?airport=${departureQuery}`
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
                .map(({ city, country }) => `${city}, ${country}`)
            : [];
          const airportSuggestions = Array.isArray(airports)
            ? airports.slice(0, 5).map(({ name }) => name)
            : [];
          setDepartureSuggestions([...citySuggestions, ...airportSuggestions]);
        })
        .catch((err) =>
          console.error("Error fetching departure suggestions:", err)
        );
    } else {
      setDepartureSuggestions([]);
    }
  }, [departureQuery]);

  return (
    <>
      <Header />
      <main className="px-16 py-0 max-md:px-8" style={{ marginTop: "100px" }}>
        {/* Search Section */}
        <div className="mb-10 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <SearchForm
            departureQuery={departureQuery}
            setDepartureQuery={setDepartureQuery}
            departureSuggestions={departureSuggestions}
            setDepartureSuggestions={setDepartureSuggestions}
            arrivalQuery={arrivalQuery}
            setArrivalQuery={setArrivalQuery}
            arrivalSuggestions={arrivalSuggestions}
            setArrivalSuggestions={setArrivalSuggestions}
            tripType={tripType}
            setTripType={setTripType}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>

        {/* Error Message
        {errorMessage && <div className="text-center text-red-500 mt-4">{errorMessage}</div>} */}

        {/* Render FlightResults */}
        {!isLoading && flightData.length > 0 && (
          <div className="mb-10 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Flight Results
            </h2>
            <FlightResults flights={flightData} />
          </div>
        )}

        {/* Visualization Section */}
        <div className="mb-10 bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Map Visualization
          </h2>
          <MapVisualization />
        </div>
        <HotelSection />
        <DestinationSection />
        <Footer />
      </main>
    </>
  );
};

export default TripmaTravel;
