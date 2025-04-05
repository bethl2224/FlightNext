"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Flight } from "./FlightList";
import { Hotel_Room } from "./HotelSearchBar";
import Image from "next/image";

interface FlightCartProps {
  cart: Flight[]; // Array of flights in the cart
  hotelCart: Hotel_Room[];
  removeFlightGroupToCart: (flightGroup: Flight[]) => void; // Method to remove the flight group
  removeHotelFromCart: (hotel: Hotel_Room) => void;
  handlenext: () => void;
  onSave: () => void; // Add this prop for the save functionality
}

// Helper function to calculate the number of nights
const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};

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

const FlightCart: React.FC<FlightCartProps> = ({
  cart,
  hotelCart,
  removeHotelFromCart,
  removeFlightGroupToCart,
  handlenext,
  onSave,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalFlightPrice, setTotalFlightPrice] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalHotelPrice, setTotalHotelPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Recalculate prices whenever the cart or hotelCart changes
  useEffect(() => {
    // Calculate total flight price (each flight is $100)
    const flightPrice = cart.length * 100;

    // Calculate total hotel price based on room type price per night
    const hotelPrice = hotelCart.reduce((total, hotel) => {
      const nights = calculateNights(hotel.checkInDate, hotel.checkOutDate);
      return total + nights * (hotel.pricePerNight || 0);
    }, 0);

    setTotalFlightPrice(flightPrice);
    setTotalHotelPrice(hotelPrice);
    setTotalPrice(flightPrice + hotelPrice);
  }, [cart, hotelCart]);

  // Taxes and fees (example: 10% of the subtotal)
  const taxesAndFees = Math.round(totalPrice * 0.1);

  // Final total
  const finalTotal = totalPrice + taxesAndFees;

  // Store the total amount breakdown in session storage
  useEffect(() => {
    sessionStorage.setItem(
      "totalAmountBreakdown",
      JSON.stringify({
        subtotal: totalPrice,
        taxesAndFees,
        total: finalTotal,
      })
    );
  }, [totalPrice, taxesAndFees, finalTotal]);

  return (
    <>
    <div className="flex flex-col w-full max-md:mt-10">
      <div className="flex flex-col items-end w-full text-base">
        {/* Flights Section */}
        <div className="flex flex-col justify-center p-4 w-full bg-white rounded-xl border border-solid border-[#E9E8FC] max-w-[400px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Flights</h2>
          {!cart || cart.length === 0 ? (
            <p className="text-center text-gray-500">Your flight cart is empty.</p>
          ) : (
            cart.map((flight) => (
              <div
                key={flight.id}
                className="flex gap-2 items-start p-2 w-full mb-4 bg-gray-50 rounded-lg shadow-sm"
              >
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8c61310b1f4c3873131865614d330f4e05bfaae?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
                  alt="Airline logo"
                  className="object-contain shrink-0 w-10 aspect-square"
                  width={40}
                  height={40}
                />
                <div className="flex-1 shrink basis-0">
                  <h3 className="text-slate-800 font-medium">{flight.flightNumber}</h3>
                  <p className="mt-1 text-slate-400">
                    {flight.origin_name} → {flight.dest_name}
                  </p>
                </div>
                <div className="flex-1 shrink text-right basis-0 text-slate-800">
                  <p>
                    {formatFlightDateTime(flight.departureTime)} - {formatFlightDateTime(flight.arrivalTime)}
                  </p>
                </div>
                <button
                  onClick={() => removeFlightGroupToCart([flight])} // Remove a single flight
                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Hotels Section */}
        <div className="flex flex-col justify-center p-4 w-full bg-white rounded-xl border border-solid border-[#E9E8FC] max-w-[400px] mt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Hotels</h2>
          {!hotelCart || hotelCart.length === 0 ? (
            <p className="text-center text-gray-500">Your hotel cart is empty.</p>
          ) : (
            hotelCart.map((hotel) => (
              <div
                key={hotel.id}
                className="flex gap-2 items-start p-2 w-full mb-4 bg-gray-50 rounded-lg shadow-sm"
              >
                <Image
                  src={hotel.logo}
                  alt={`${hotel.name} Logo`}
                  className="object-contain shrink-0 w-10 aspect-square"
                  width={40}
                  height={40}
                />
                <div className="flex-1 shrink basis-0">
                  <h3 className="text-slate-800 font-medium">{hotel.name}</h3>
                  <p className="mt-1 text-slate-400">{hotel.roomType}</p>
                  <p className="mt-1 text-slate-400">${hotel.pricePerNight} per night</p>
                  <p className="mt-1 text-slate-400">CheckInDate: {hotel.checkInDate}</p>
                  <p className="mt-1 text-slate-400">CheckOutDate: {hotel.checkOutDate}</p>
                </div>
                <button
                  onClick={() => removeHotelFromCart(hotel)} // Remove a single hotel
                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total Price Section */}
      <div className="text-right mt-6">
        <div className="flex gap-10 items-start p-4 font-semibold text-right text-slate-800">
          <dl className="w-[120px]">
            <dt>Subtotal</dt>
            <dt className="mt-2">Taxes and Fees</dt>
            <dt className="mt-2">Total</dt>
          </dl>
          <div className="flex flex-col items-end whitespace-nowrap">
            <dd>${totalPrice}</dd>
            <dd className="mt-2">${taxesAndFees}</dd>
            <dd className="mt-2">${finalTotal}</dd>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          className="px-5 py-3 text-lg text-indigo-500 rounded border border-solid border-[#605DEC] hover:bg-indigo-100 transition"
          aria-label="Save flight selection and close"
          onClick={onSave} // Call the onSave function
        >
          Save Progress
        </button>

        <button
          className="px-5 py-3 text-lg text-indigo-500 rounded border border-solid border-[#605DEC] hover:bg-indigo-100 transition"
          aria-label="Proceed to the next step"
          onClick={() => {
            if ((!cart || cart.length === 0) && (!hotelCart || hotelCart.length === 0)) {
              alert("Your cart is empty. Please add at least one flight or hotel to proceed.");
              return;
            }

            handlenext(); // Proceed to the next step if both carts are not empty
          }}
        >
          Next
        </button>
      </div>
    </div>
    </>
  );
};

export default FlightCart;