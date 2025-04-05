import { NextResponse } from "next/server";
import { getLocationFromDatabase } from "@/utils/db";
const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function getFlightDetails(origin, destination, date) {
  const url = `${baseUrl}/api/flights?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(
    date
  )}`;
  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { message: `Error fetching flight details: ${response.statusText}` },
        { status: 400 }
      );
    }
    const data = await response.json();
    if (!data || data.results.length === 0) {
      return NextResponse.json(
        { message: "Flight details not found" },
        { status: 400 }
      );
    }
    return data;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching flight details" },
      { status: 400 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let origin = searchParams.get("origin");
  let destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const round_trip_date = searchParams.get("round_trip_date");
  const flight_type = searchParams.get("flight_type");

  let orig_origin = origin;
  let orig_dest = destination;

  if (!origin || !destination || !date) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    // Check if origin is a location or airport
    origin = await getLocationFromDatabase(origin);
    if (!origin) {
      return NextResponse.json(
        { message: "Origin location not found" },
        { status: 404 }
      );
    }

    // Check if destination is a location or airport

    destination = await getLocationFromDatabase(destination);
    if (!destination) {
      return NextResponse.json(
        { message: "Destination location not found" },
        { status: 404 }
      );
    }

    if (destination === origin) {
      return NextResponse.json(
        { message: "Origin and destination cannot be at the same location" },
        { status: 400 }
      );
    }

    const oneWayFlightDetails = await getFlightDetails(
      origin,
      destination,
      date
    );
    let oneWayfilteredDetails = [];

    if (oneWayFlightDetails.results) {
      oneWayfilteredDetails = oneWayFlightDetails.results.map((result) => {
        const layovers = [];
        result.flights.forEach((flight) => {
          if (
            flight.origin.city !== origin &&
            flight.origin.city !== destination &&
            !layovers.includes(flight.origin.name)
          ) {
            layovers.push(flight.origin.name);
          }
          if (
            flight.destination.city !== origin &&
            flight.destination.city !== destination &&
            !layovers.includes(flight.destination.name)
          ) {
            layovers.push(flight.destination.name);
          }
        });
        return {
          legs: result.legs,
          flights: result.flights.map((flight) => ({
            id: flight.id,
            flightNumber: flight.flightNumber,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            origin: flight.origin,
            destination: flight.destination,
            status: flight.status,
          })),
          layovers,
        };
      });
    }

    let roundWayFlightDetails = [];

    if (round_trip_date) {
      roundWayFlightDetails = await getFlightDetails(
        destination,
        origin,
        round_trip_date
      );
    }

    let roundWayfilteredDetails = [];
    if (round_trip_date && roundWayFlightDetails.results) {
      roundWayfilteredDetails = roundWayFlightDetails.results
        .filter((result) =>
          result.flights.some((flight) => flight.destination.city === origin)
        )
        .map((result) => {
          const layovers = [];
          result.flights.forEach((flight) => {
            if (
              flight.origin.city !== origin &&
              flight.origin.city !== destination &&
              !layovers.includes(flight.origin.name)
            ) {
              layovers.push(flight.origin.name);
            }
            if (
              flight.destination.city !== origin &&
              flight.destination.city !== destination &&
              !layovers.includes(flight.destination.name)
            ) {
              layovers.push(flight.destination.name);
            }
          });
          return {
            legs: result.legs,
            flights: result.flights.map((flight) => ({
              id: flight.id,
              flightNumber: flight.flightNumber,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
              duration: flight.duration,
              origin: flight.origin,
              destination: flight.destination,
              status: flight.status,
            })),
            layovers,
          };
        });
    }

    // if the user searches the origin using airport name
    if (orig_origin !== origin) {
      if (oneWayfilteredDetails && oneWayfilteredDetails.length > 0) {
        oneWayfilteredDetails = oneWayfilteredDetails.filter(
          (result) => result.flights[0].origin.name === orig_origin
        );
      }
      if (roundWayfilteredDetails.length > 0) {
        roundWayfilteredDetails = roundWayfilteredDetails.filter(
          (result) =>
            result.flights[result.flights.length - 1].destination.name ===
            orig_origin
        );
      }
    }

    // if the user searches the destination using airport name
    if (orig_dest !== destination) {
      if (oneWayfilteredDetails && oneWayfilteredDetails.length > 0) {
        oneWayfilteredDetails = oneWayfilteredDetails.filter(
          (result) =>
            result.flights[result.flights.length - 1].destination.name ===
            orig_dest
        );

        if (roundWayfilteredDetails.length > 0) {
          roundWayfilteredDetails = roundWayfilteredDetails.filter(
            (result) => result.flights[0].origin.name === orig_dest
          );
        }
      }
    }

    let response;
    if (flight_type !== "round_trip") {
      if (oneWayfilteredDetails.length === 0) {
        return NextResponse.json(
          { message: "No suitable one way trips available" },
          { status: 404 } // Return 404 status code for this case
        );
      } else {
        response = {
          tripType: "one-way",
          results: {
            oneWayTrips: oneWayfilteredDetails,
          },
        };
      }
    } else {
      if (roundWayfilteredDetails.length === 0) {
        return NextResponse.json(
          { message: "No suitable round trips available" },
          { status: 404 } // Return 404 status code for this case
        );
      } else {
        response = {
          tripType: "both",
          results: {
            oneWayTrips: oneWayfilteredDetails,
            roundTrip: roundWayfilteredDetails,
          },
        };
      }
    }
  
    return NextResponse.json(response);
  } catch (error) {
    console.log(error.stack);
    if (error.message === "Flight details not found") {

      response = {
        tripType: "both",
        results: {
          oneWayTrips: [],
          roundTrip: [],
        },
      };
      return NextResponse.json(
      response,
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
