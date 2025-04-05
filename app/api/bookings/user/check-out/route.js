import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { get_flight_bookings } from "@/utils/fetch-flight";

function validateCreditCard(cardNumber, expiryDate) {
  // Luhn Algorithm for card number validation
  const isValidCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Expiry date validation
  const isValidExpiryDate = (date) => {
    const [month, year] = date.split("/").map(Number);
    const now = new Date();
    const expiry = new Date(`20${year}`, month - 1);
    return expiry > now;
  };

  return isValidCardNumber(cardNumber) && isValidExpiryDate(expiryDate);
}



export async function POST(req) {
  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { itineraryId, cardNumber, expiryDate } = await req.json();

    if (!itineraryId || !cardNumber || !expiryDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate credit card details
    if (!validateCreditCard(cardNumber, expiryDate)) {
      return NextResponse.json(
        { error: "Invalid credit card details" },
        { status: 400 }
      );
    }

    // Fetch the itinerary details
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

     // New change also getting a list of APIs from the external flight API
    // New change also getting a list of APIs from the external flight API
   
    for (let j = 0; j < itinerary.flights.length; j++) {
          const flight = itinerary.flights[j];
          const flightBooking = await get_flight_bookings(flight.lastName, flight.bookingReference);
          itinerary.flightBooking = flightBooking;
        }
      

    // Finalize the booking (mock action)
    return NextResponse.json(
      {
        message: "Booking finalized successfully",
        itinerary
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}