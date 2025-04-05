import React, { useState } from "react";
import Header from "../main/Header"; // Adjust the path if necessary
import Footer from "../main/Footer"; // Adjust the path if necessary

const CheckFlights = () => {
  const [lastName, setLastName] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [flightDetails, setFlightDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckFlights = async () => {
    setError("");
    setFlightDetails(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/bookings/user/flight-retrieve?lastName=${encodeURIComponent(
          lastName
        )}&bookingReference=${encodeURIComponent(bookingReference)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to retrieve flight details");
        return;
      }

      const data = await response.json();
      setFlightDetails(data);
    } catch (err) {
      console.error("Error fetching flight details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">
          Check Flight Details
        </h1>

        {/* Input Form */}
        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your last name"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold text-gray-700">
            Booking Reference
          </label>
          <input
            type="text"
            value={bookingReference}
            onChange={(e) => setBookingReference(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your booking reference"
          />
        </div>

        <button
          onClick={handleCheckFlights}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Flights"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Flight Details */}
        {flightDetails && (
          <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Booking Details
            </h2>
            <p>
              <strong>Booking Reference:</strong>{" "}
              {flightDetails.bookingReference}
            </p>
            <p>
              <strong>Ticket Number:</strong> {flightDetails.ticketNumber}
            </p>
            <p>
              <strong>Name:</strong> {flightDetails.firstName}{" "}
              {flightDetails.lastName}
            </p>
            <p>
              <strong>Email:</strong> {flightDetails.email}
            </p>
            <p>
              <strong>Passport Number:</strong> {flightDetails.passportNumber}
            </p>
            <p>
              <strong>Status:</strong> {flightDetails.status}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(flightDetails.createdAt).toLocaleString()}
            </p>

            {/* Flights Section */}
            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">
              Flight Details
            </h3>
            {flightDetails.flights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 bg-white rounded-lg shadow-md mb-4"
              >
                <p>
                  <strong>Flight Number:</strong> {flight.flightNumber}
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {new Date(flight.departureTime).toLocaleString()}
                </p>
                <p>
                  <strong>Arrival:</strong>{" "}
                  {new Date(flight.arrivalTime).toLocaleString()}
                </p>
                <p>
                  <strong>Origin:</strong> {flight.origin.name} (
                  {flight.origin.code}), {flight.origin.city},{" "}
                  {flight.origin.country}
                </p>
                <p>
                  <strong>Destination:</strong> {flight.destination.name} (
                  {flight.destination.code}), {flight.destination.city},{" "}
                  {flight.destination.country}
                </p>
                <p>
                  <strong>Duration:</strong> {flight.duration} minutes
                </p>
                <p>
                  <strong>Price:</strong> {flight.price} {flight.currency}
                </p>
                <p>
                  <strong>Status:</strong> {flight.status}
                </p>
                <p>
                  <strong>Airline:</strong> {flight.airline.name} (
                  {flight.airline.code})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CheckFlights;