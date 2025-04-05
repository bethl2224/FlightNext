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