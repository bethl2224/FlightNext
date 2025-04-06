const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;


export async function get_flight_bookings(lastName, bookingReference) {
    const url = `${baseUrl}/api/bookings/retrieve?lastName=${lastName}&bookingReference=${bookingReference}`;
    const response = await fetch(url, {
     headers: {
         "x-api-key": apiKey,
       },
    });
    if (!response.ok) {
      throw new Error('Failed to retrieve flight bookings');
    }
    const data = await response.json();
    return data;
  }




  export async function fetchAndComputeFlightPrices(flights) {
    try {
      // Fetch flight bookings
      const flightInfoPromises = flights.map(async (flight) => {
        try {
          const externalApiUrl = `${process.env.FLIGHT_URL}/api/bookings/retrieve?lastName=${flight.lastName}&bookingReference=${flight.bookingReference}`;
          const response = await fetch(externalApiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.API_KEY,
            },
          });
  
          if (!response.ok) {
            throw new Error(`Error fetching flight info: ${response.statusText}`);
          }
  
          const flightBooking = await response.json();
          return flightBooking;
        } catch (error) {
          console.error(
            `Failed to fetch flight info for bookingReference: ${flight.bookingReference}`,
            error
          );
          return null; // Handle errors gracefully
        }
      });
  
      const flightBookings = await Promise.all(flightInfoPromises);
  
      // Compute total flight price
      const flightPrice = flightBookings.reduce((total, flightBooking) => {
        if (flightBooking && flightBooking.flights) {
          return (
            total +
            flightBooking.flights.reduce(
              (subtotal, flight) => subtotal + (flight.price || 0),
              0
            )
          );
        }
        return total;
      }, 0);
  
      return { flightBookings, flightPrice };
    } catch (error) {
      console.error("Error fetching and computing flight prices:", error);
      return { flightBookings: [], flightPrice: 0 };
    }
  
  }
  

  export const calculateNights = (checkInDate, checkOutDate) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  };