"use client";
import * as React from "react";
import AuthInput from "@pages/auth/AuthInput";
import { useState } from "react";
import "@pages/styles/globals.css";
import { validateDate } from "@/utils/hotel-query";

function BookingRecord({
  roomType,
  hotelId,
}: {
  roomType: string;
  hotelId: number;
}) {
  const [bookCheckInDate, setBookCheckInDate] = useState<string>(() => {
    // Initialize with today's date in YYYY-MM-DD format
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  });

  const [bookcheckOutDate, setBookCheckOutDate] = useState<string>(() => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7); // Add 7 days to today's date
    return `${oneWeekLater.getFullYear()}-${(oneWeekLater.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${oneWeekLater.getDate().toString().padStart(2, "0")}`;
  });

  const [creditCardInfo, setCreditCardInfo] = useState<string>("");

  const [message, setMessage] = useState(""); // Success message

  // ADD Booking data
  const handleBookNow = async () => {
    setMessage("");

    const bookingData = {
      hotelId: hotelId,
      roomType: roomType,
      checkInDate: bookCheckInDate,
      checkOutDate: bookcheckOutDate,
    };
    console.log("*****************************");
    console.log("Booking data:", bookingData);
    console.log("*****************************");

    if (!validateDate(bookCheckInDate, bookcheckOutDate)) {
      setMessage("Invalid date range");
      return;
    }

    try {
      const response = await fetch("/api/hotel/user/room-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const result = await response.json();
      console.log("Booking created successfully:", result);
      setMessage("Success");
    } catch (error) {
      console.log(error);
      setMessage("Error");
    }
  };

  return (
    <section className="flex overflow-hidden flex-col px-10 pt-10 pb-40 text-lg bg-white rounded-xl border border-solid shadow-md border-[color:var(--Grey-200,#CBD4E6)] max-w-[883px] max-md:px-5 max-md:pb-24">
      <header className="flex flex-col justify-center items-center self-center pb-2 max-w-full text-2xl font-bold text-slate-500 w-[488px]">
        <div className="flex flex-wrap gap-2.5 justify-center items-center w-full max-md:max-w-full">
          <h1 className="text-center flex items-center gap-2 max-md:max-w-full max-md:text-center">
            HotelBooking
          </h1>
        </div>
      </header>

      <AuthInput
        placeholder="Credit Card Info"
        value={creditCardInfo}
        onChange={(e) => setCreditCardInfo(e.target.value)}
        type="text"
        className="mt-3 w-full text-slate-400 max-md:max-w-full"
      />

      {/* Check-In-Date Input */}
      <div className="relative">
        <label className="block text-sm text-slate-500 mb-1">
          Check-In-Date
        </label>
        <input
          type="date"
          value={bookCheckInDate}
          onChange={(e) => setBookCheckInDate(e.target.value)} // Update state on input
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-label="Check-in date"
        />
      </div>

      {/* Check-Out-Date Input */}
      <div className="relative">
        <label className="block text-sm text-slate-500 mb-1">
          Check-Out-Date
        </label>
        <input
          type="date"
          value={bookcheckOutDate}
          onChange={(e) => setBookCheckOutDate(e.target.value)} // Update state on input
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-label="Check-out date"
        />
      </div>

      <button
        onClick={handleBookNow}
        className="overflow-hidden flex-1 shrink gap-2 self-stretch px-5 py-3 mt-3 w-full text-center bg-indigo-500 rounded basis-0 min-h-12 text-neutral-50 max-md:max-w-full"
      >
        Book Now
      </button>
      <div className="text-center">
        {message === "Success"
          ? "Successfully booked!"
          : message === "Error"
          ? "An error occurred."
          : message === "Invalid date range"
          ? "Invalid date range"
          : ""}
      </div>

      <section className="flex flex-col justify-center items-center self-center pt-2 mt-3 max-w-full text-indigo-500 w-[488px]"></section>
    </section>
  );
}

function BookingModal({
  roomType,
  hotelId,
}: {
  roomType: string;
  hotelId: number;
}) {
  // Function implementation

  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleModal}
          className="absolute top-4 right-4 px-5 py-3 text-base bg-indigo-500 rounded cursor-pointer border-none text-neutral-50 hover:bg-indigo-600 transition-colors"
        >
          Book Now
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white mb-10 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <BookingRecord roomType={roomType} hotelId={hotelId} />
            <button
              onClick={toggleModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingModal;
