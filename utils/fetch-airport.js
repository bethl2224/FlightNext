import { prisma } from "./db.js";

const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function fetchAndStoreAirports() {
  const url = `${baseUrl}/api/airports`;
  console.log(url);
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching city data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data)
    for (const air_port of data) {
      await prisma.airport.create({
        data: {
          id: air_port.id,
          code: air_port.code,
          name: air_port.name,
          location: { connect: { city_country: { city: air_port.city, country: air_port.country } } }
        }
      });
    }
    console.log('Airports stored successfully');
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndStoreAirports();