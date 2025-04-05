"use client";
import Image from "next/image";
import { apiURl } from "@/utils/hotel-query";
import React, { useEffect, useState } from "react";
import Header from "@pages/main/Header";
import { deleteBookingUser } from "@/utils/delete-hotel";

interface Booking {
  id: number;
  creditCardInfo: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  hotelId: number;
  userId: number;
  itineraryId: number | null;
  createdAt: string;
  updatedAt: string;
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  hotelAddress: string;
  hotelStarRating: number;
  hotelLogo: string;
}

function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]); // Initialize with an empty array
  useEffect(() => {
    const fetchBookings = async () => {
      const response = await fetch(
        `${process.env.API_URL}/api/hotel/user/room-booking`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      // Handle the response here if needed
      const data = await response.json();
      console.log("Bookings data:", data);
      setBookings(data); // Set the bookings state with the fetched data
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <Header />
      <div className="bookings-container mt-20 p-5">
        <h1 className="text-center mb-5 text-2xl font-bold">Your Bookings</h1>
        {bookings.length > 0 ? (
          <ul className="list-none p-0">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="booking-item border border-gray-200 rounded-lg p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-4 p-5 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">
                    {booking.hotelName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>City:</strong> {booking.hotelCity}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Country:</strong> {booking.hotelCountry}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Address:</strong> {booking.hotelAddress}
                  </p>
                  <p className="text-sm text-yellow-500 mb-1">
                    <strong>Star Rating:</strong> {booking.hotelStarRating} ⭐
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Room Type:</strong> {booking.roomType}
                  </p>
                  <p className="text-sm text-green-600 mb-1">
                    <strong>Check-In Date:</strong>{" "}
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-red-600">
                    <strong>Check-Out Date:</strong>{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                  <div className="text-sm text-gray-600 mb-1 flex flex-col items-end">
                    <div className="mt-2">
                      <Image
                        width={100}
                        height={100}
                        src={booking.hotelLogo}
                        alt={`${booking.hotelName} Logo`}
                        className="w-32 h-32 object-contain border border-gray-200 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await deleteBookingUser(booking.id);
                      setBookings((prev) =>
                        prev.filter((b) => b.id !== booking.id)
                      );
                    } catch (error) {
                      console.error("Failed to delete booking:", error);
                    }
                  }}
                  className="cancel-button bg-red-500 text-white rounded-md px-5 py-2 font-semibold hover:bg-red-600 transition-colors duration-300"
                >
                  Cancel Booking
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default UserBookings;
