"use client";

import React, { useEffect, useState } from "react";
import Header from "@pages/main/Header";
import { fetchRoomTypes } from "@/utils/hotel-query";
import { deleteBookingOwner } from "@/utils/delete-hotel";
import Dropdown from "./FilterBookingLabel";

interface Booking {
  id: number;
  creditCardInfo: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  roomType: string;
  hotelId: number;
  userId: number;
  itineraryId: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface RoomTypeBooking {
  [hotelName: string]: {
    [roomType: string]: Booking[] | undefined; // Array of bookings or undefined if no bookings exist
  };
}

const Bookings: React.FC = () => {
  const [roomTypeBooking, setRoomTypeBooking] =
    useState<RoomTypeBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState<string[] | null>(null);
  const [singleRoomType, setSingleRoomType] = useState<string>("All");

  // Get current year
  const currentYear = new Date().getFullYear();

  // Default check-in and check-out dates
  const defaultCheckInDate = `${currentYear}-01-01`; // January 1st of the current year
  const defaultCheckOutDate = `${currentYear}-12-31`; // December 31st of the current year

  const [checkInDate, setCheckInDate] = useState<string>(defaultCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultCheckOutDate);
  useEffect(() => {
    const fetchRoomTypesAsync = async () => {
      const roomTypes = await fetchRoomTypes();
      setRoomType(roomTypes);
      console.log(roomTypes);
    };

    fetchRoomTypesAsync();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (checkInDate) {
          params.append("checkInDate", checkInDate);
        }
        if (checkOutDate) {
          params.append("checkOutDate", checkOutDate);
        }
        if (singleRoomType) {
          params.append("roomType", singleRoomType);
        }

        console.log("PARAMS ****************");
        console.log(params.toString());

        const response = await fetch(
          `/api/hotel/owner/view-bookings?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        ); // Replace with your actual API endpoint
        const data = await response.json();
        console.log("EFFECT ****************");

        console.log(data.roomTypeBooking, data.roomTypeBooking);
        setRoomTypeBooking(data.roomTypeBooking);

        console.log(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [checkInDate, checkOutDate, singleRoomType]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!roomTypeBooking) {
    return (
      <>
        <Header />
        {/* Check-In-Date Input */}{" "}
        <div className="mt-40 mr-10 relative flex items-center justify-end space-x-4">
          {" "}
          {/* Increased margin-top to move the section further down */}
          <div className="relative">
            <label
              htmlFor="filter"
              className="block text-sm text-slate-500 mb-1"
            >
              Filter
            </label>

            <Dropdown
              options={[...(roomType || []), "All"]}
              onSelect={setSingleRoomType}
              singleRoomType={singleRoomType}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onSetRoomTypeBooking={setRoomTypeBooking}
            />
          </div>
          <div className="relative">
            <label
              htmlFor="check-in-date"
              className="block text-sm text-slate-500 mb-1"
            >
              Check-In Date
            </label>
            <input
              id="check-in-date"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)} // Update state on input
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Check-in date"
            />
          </div>
          {/* Check-Out-Date Input */}
          <div className="relative">
            <label
              htmlFor="check-oute-date"
              className="block text-sm text-slate-500 mb-1"
            >
              Check-out Date
            </label>
            <input
              id="check-out-date"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)} // Update state on input
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Check-in date"
            />
          </div>
        </div>
        <div className="mt-10">
          <p className="text-center text-gray-500 italic">
            No bookings available.
          </p>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Header />
        {/* Check-In-Date Input */}
        <div className="mt-40 mr-10 relative flex items-center justify-end space-x-4">
          <div className="relative">
            <label
              htmlFor="filter"
              className="block text-sm text-slate-500 mb-1"
            >
              Filter
            </label>

            <Dropdown
              options={[...(roomType || []), "All"]}
              onSelect={setSingleRoomType}
              singleRoomType={singleRoomType}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onSetRoomTypeBooking={setRoomTypeBooking}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="check-in-date"
              className="block text-sm text-slate-500 mb-1"
            >
              Check-In Date
            </label>
            <input
              id="check-in-date"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)} // Update state on input
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Check-in date"
            />
          </div>
          {/* Check-Out-Date Input */}

          <div className="relative">
            <label
              htmlFor="check-out-date"
              className="block text-sm text-slate-500 mb-1"
            >
              Check-Out Date
            </label>
            <input
              id="check-out-date"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)} // Update state on input
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Check-in date"
            />
          </div>
        </div>
        <div className="p-4 ml-20 mb-4 mt-20">
          {roomTypeBooking &&
            Object.keys(roomTypeBooking).map((hotelName) => (
              <div key={hotelName} className="mb-8">
                {/* Hotel Name */}
                <h2 className="text-2xl font-extrabold text-indigo-600 mb-4 border-b border-gray-300 pb-2">
                  {hotelName}
                </h2>
                {Object.keys(roomTypeBooking[hotelName]).length === 0 ? (
                  <p className="text-gray-500 italic">
                    No bookings available for this hotel.
                  </p>
                ) : (
                  Object.keys(roomTypeBooking[hotelName]).map((roomType) => (
                    <div key={roomType} className="mb-6">
                      {/* Room Type */}
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {roomType}
                      </h3>
                      {Array.isArray(roomTypeBooking[hotelName][roomType]) &&
                      (
                        roomTypeBooking[hotelName][roomType] as
                          | Booking[]
                          | undefined
                      )?.length === 0 ? (
                        <p className="text-gray-500 italic">
                          No bookings available for this room type.
                        </p>
                      ) : (
                        <ul className="list-disc pl-8 space-y-4">
                          {Array.isArray(
                            roomTypeBooking[hotelName][roomType]
                          ) &&
                            (
                              roomTypeBooking[hotelName][roomType] as
                                | Booking[]
                                | undefined
                            )?.map((booking) => (
                              <li key={booking.id} className="mb-4">
                                {/* Booking Details */}
                                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                                  <p className="text-sm text-gray-600">
                                    <strong>Booking ID:</strong> {booking.id}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Check-In:</strong>{" "}
                                    {new Date(
                                      booking.checkInDate
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Check-Out:</strong>{" "}
                                    {new Date(
                                      booking.checkOutDate
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>User ID:</strong> {booking.userId}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Credit Card Info:</strong>{" "}
                                    {booking.creditCardInfo}
                                  </p>
                                  <button
                                    onClick={async () => {
                                      const res = await deleteBookingOwner(
                                        booking.id
                                      );
                                      if (res) {
                                        setRoomTypeBooking((prev) => {
                                          const updated = { ...prev };

                                          // Filter out the deleted booking
                                          updated[hotelName][roomType] =
                                            updated[hotelName][
                                              roomType
                                            ]?.filter(
                                              (b) => b.id !== booking.id
                                            );

                                          // If no bookings remain for the room type, delete the room type
                                          if (
                                            updated[hotelName][roomType]
                                              ?.length === 0
                                          ) {
                                            delete updated[hotelName][roomType];
                                          }

                                          // If no room types remain for the hotel, delete the hotel
                                          if (
                                            Object.keys(updated[hotelName])
                                              .length === 0
                                          ) {
                                            delete updated[hotelName];
                                          }

                                          return updated;
                                        });
                                      }
                                    }}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                                  >
                                    <strong>Cancel</strong>
                                  </button>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
        </div>
      </>
    );
  }
};

export default Bookings;
