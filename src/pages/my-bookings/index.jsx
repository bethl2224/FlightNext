import React, { useEffect, useState } from "react";
import Header from "../main/Header"; // Adjust the path to your Header component
import Footer from "../main/Footer"; // Adjust the path to your Footer component
import { useRouter } from "next/router";

const MyBookings = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [selectedItinerary, setSelectedItinerary] = useState(null); // Track the selected itinerary for the modal
  const itemsPerPage = 3; // Number of itineraries to display per page

  const filterEmptyItineraries = () => {
    setItineraries((prevItineraries) =>
      prevItineraries.filter(
        (itinerary) =>
          itinerary.flightBooking?.flights?.length > 0 ||
          itinerary.hotelBookings?.length > 0
      )
    );
  };

  const router = useRouter();
  useEffect(() => {
    const fetchItineraries = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.API_URL}/api/bookings/user/itinerary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
          }
        );

        if (!response.ok) {
          alert("Failed to fetch itineraries");
          router.push("/");
        }

        const data = await response.json();
        setItineraries(data.itineraries || []);
      } catch (err) {
        console.error("Error fetching itineraries:", err);
        setError("Failed to load itineraries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  // Calculate the current items to display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItineraries = itineraries.slice(startIndex, endIndex);

  const handleNext = () => {
    if (currentPage < Math.ceil(itineraries.length / itemsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const openModal = (itinerary) => {
    setSelectedItinerary(itinerary);
  };

  const closeModal = () => {
    setSelectedItinerary(null);
  };

  const cancelItinerary = async (itineraryId) => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/bookings/user/itinerary/${itineraryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel itinerary");
      }

      // Update the state to remove the canceled itinerary
      setItineraries((prevItineraries) =>
        prevItineraries.filter((itinerary) => itinerary.id !== itineraryId)
      );

      alert("Itinerary canceled successfully!");
    } catch (error) {
      console.error("Error canceling itinerary:", error);
      alert("Failed to cancel itinerary. Please try again.");
    }
  };

  const cancelHotel = async (hotelId) => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/bookings/user/hotel-cancel/${hotelId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        alert("Failed to cancel hotel booking");
        router.push("/");
      }

      // Update the state to remove the canceled hotel booking
      setItineraries((prevItineraries) =>
        prevItineraries.map((itinerary) => ({
          ...itinerary,
          hotelBookings: itinerary.hotelBookings.filter(
            (hotel) => hotel.id !== hotelId
          ),
        }))
      );

      // Filter out empty itineraries
      filterEmptyItineraries();

      alert("Hotel booking canceled successfully!");
    } catch (error) {
      console.error("Error canceling hotel booking:", error);
      alert("Failed to cancel hotel booking. Please try again.");
    }
  };

  const cancelAllFlights = async (itineraryId, lastName, bookingReference) => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/bookings/user/flight-cancel?lastName=${lastName}&bookingReference=${bookingReference}&itineraryId=${itineraryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel all flights");
      }

      // Update the state to remove all flights from the itinerary
      setItineraries((prevItineraries) =>
        prevItineraries.map((itinerary) =>
          itinerary.id === itineraryId
            ? {
                ...itinerary,
                flightBooking: {
                  ...itinerary.flightBooking,
                  flights: [], // Clear all flights
                },
              }
            : itinerary
        )
      );

      // Filter out empty itineraries
      filterEmptyItineraries();

      alert("All flights canceled successfully!");
    } catch (error) {
      console.error("Error canceling all flights:", error);
      alert("Failed to cancel all flights. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-700">
          My Bookings
        </h1>
        {/* Show loading spinner or message while fetching itineraries */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-solid"></div>
            <p className="ml-4 text-lg text-gray-600">Loading itineraries...</p>
          </div>
        ) : itineraries.length === 0 ? (
          // Show message if no itineraries are found
          <p className="text-center text-gray-600">No itineraries found.</p>
        ) : (
          // Show itineraries if they exist
          <>
            <div className="grid grid-cols-1 gap-8">
              {currentItineraries.map((itinerary) => (
                <div
                  key={itinerary.id}
                  className="bg-white shadow-lg rounded-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Itinerary #{itinerary.id}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    <strong>Created:</strong>{" "}
                    {new Date(itinerary.createdAt).toLocaleDateString()}
                  </p>

                  {/* Flights Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Flights
                    </h3>

                    {itinerary.flightBooking && (
                      <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
                        <p className="text-lg text-gray-800">
                          <strong className="text-purple-700">Status:</strong>{" "}
                          {itinerary.flightBooking.status}
                        </p>
                        <p className="text-lg text-gray-800">
                          <strong className="text-purple-700">
                            Booking Reference:
                          </strong>{" "}
                          {itinerary.flightBooking.bookingReference}
                        </p>
                        <p className="text-lg text-gray-800">
                          <strong className="text-purple-700">
                            Ticket Number:
                          </strong>{" "}
                          {itinerary.flightBooking.ticketNumber}
                        </p>
                      </div>
                    )}
                    {/* Right Side: Placeholder or Additional Content */}
                    <div></div>

                    {itinerary.flightBooking?.flights?.length > 0 ? (
                      itinerary.flightBooking.flights.map((flight, index) => (
                        <div
                          key={flight.id}
                          className="p-4 bg-gray-50 rounded-lg shadow-sm mb-4 flex flex-wrap items-center justify-between"
                        >
                          <div className="flex flex-wrap gap-4">
                            <p>
                              <strong>Flight Number:</strong>{" "}
                              {flight.flightNumber}
                            </p>
                            <p>
                              <strong>Departure:</strong>{" "}
                              {new Date(flight.departureTime).toLocaleString()}
                            </p>
                            <p>
                              <strong>Arrival:</strong>{" "}
                              {new Date(flight.arrivalTime).toLocaleString()}
                            </p>
                          </div>

                          {/* Cancel Button for the First Flight Only */}
                          {index === 0 && (
                            <button
                              onClick={() =>
                                cancelAllFlights(
                                  itinerary.id,
                                  itinerary.flightBooking.lastName,
                                  itinerary.flightBooking.bookingReference
                                )
                              }
                              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg shadow hover:bg-red-600 transition"
                            >
                              Cancel Flight Trip
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No flights booked.</p>
                    )}
                  </div>

                  {/* Hotels Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Hotels
                    </h3>
                    {itinerary.hotelBookings.length > 0 ? (
                      itinerary.hotelBookings.map((hotel) => (
                        <div
                          key={hotel.id}
                          className="p-4 bg-gray-50 rounded-lg shadow-sm mb-4 flex flex-wrap items-center justify-between"
                        >
                          <div className="flex flex-wrap gap-4">
                            <p>
                              <strong>Hotel ID:</strong> {hotel.hotelId}
                            </p>
                            <p>
                              <strong>Room Type:</strong> {hotel.roomType}
                            </p>
                            <p>
                              <strong>Check-In:</strong>{" "}
                              {new Date(hotel.checkInDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Check-Out:</strong>{" "}
                              {new Date(
                                hotel.checkOutDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => cancelHotel(hotel.id)}
                            className="mt-2 md:mt-0 px-4 py-2 bg-red-500 text-white text-sm rounded-lg shadow hover:bg-red-600 transition"
                          >
                            Cancel Hotel
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No hotel bookings.</p>
                    )}
                  </div>

                  {/* Cancel Itinerary Button */}
                  <button
                    onClick={() => cancelItinerary(itinerary.id)}
                    className="mt-4 px-6 py-3 bg-red-500 text-white text-lg rounded-lg shadow hover:bg-red-600 transition"
                  >
                    Cancel Itinerary
                  </button>

                  {/* View Details Button */}
                  <button
                    onClick={() => openModal(itinerary)}
                    className="mt-4 ml-4 px-6 py-3 bg-purple-500 text-white text-lg rounded-lg shadow hover:bg-purple-600 transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-lg shadow ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                Previous
              </button>
              <span className="text-lg text-gray-700">
                Page {currentPage} of{" "}
                {Math.ceil(itineraries.length / itemsPerPage)}
              </span>
              <button
                onClick={handleNext}
                disabled={
                  currentPage === Math.ceil(itineraries.length / itemsPerPage)
                }
                className={`px-6 py-3 rounded-lg shadow ${
                  currentPage === Math.ceil(itineraries.length / itemsPerPage)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {/* Modal */}
      {/* Modal */}
      {selectedItinerary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl p-8 rounded-lg shadow-lg relative h-[600px] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal} // Calls the closeModal function to close the modal
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
              aria-label="Close"
            >
              &times; {/* This renders the "X" symbol */}
            </button>

            {/* Modal Content */}
            <h2 className="text-3xl font-bold mb-6">
              Itinerary #{selectedItinerary.id}
            </h2>
            <p className="text-lg mb-4">
              <strong>Created:</strong>{" "}
              {new Date(selectedItinerary.createdAt).toLocaleDateString()}
            </p>
            <p className="text-lg mb-6">
              <strong>Updated:</strong>{" "}
              {new Date(selectedItinerary.updatedAt).toLocaleDateString()}
            </p>

            {/* Flights Section */}
            <h3 className="text-2xl font-semibold mb-4">Flights</h3>
            {selectedItinerary.flightBooking?.flights?.length > 0 ? (
              selectedItinerary.flightBooking.flights.map((flight, index) => (
                <div key={index} className="mb-6 border-b pb-4">
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
                </div>
              ))
            ) : (
              <p>No flights booked.</p>
            )}

            <br></br>

            {/* Hotels Section */}
            <h3 className="text-2xl font-semibold mb-4 mt-6">Hotels</h3>
            {selectedItinerary.hotelBookings.length > 0 ? (
              selectedItinerary.hotelBookings.map((hotel, index) => (
                <div
                  key={index}
                  className="mb-6 border-b pb-4 flex items-center gap-6"
                >
                  {/* Hotel Details */}
                  <div className="flex-1">
                    <p>
                      <strong>Hotel ID:</strong> {hotel.hotelId}
                    </p>
                    <p>
                      <strong>Room Type:</strong> {hotel.roomType}
                    </p>
                    <p>
                      <strong>Check-In:</strong>{" "}
                      {new Date(hotel.checkInDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Check-Out:</strong>{" "}
                      {new Date(hotel.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Hotel Image */}
                  {hotel.images && hotel.images.length > 0 && (
                    <img
                      src={hotel.images[0]}
                      alt={`Hotel ${hotel.hotelId}`}
                      className="w-40 h-40 object-cover rounded-lg shadow-md"
                    />
                  )}
                </div>
              ))
            ) : (
              <p>No hotel bookings.</p>
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default MyBookings;
