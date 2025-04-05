import { prisma } from "./db.js";


const baseUrl = process.env.FLIGHT_URL;
const apiKey = process.env.API_KEY;

async function fetchAndStoreCities() {
    const url = `${baseUrl}/api/cities`;
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
      for (const location of data) {
        await prisma.location.create({
          data: { city: location.city, country: location.country }
        });
        
      }
      console.log('Cities stored successfully');
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }


  
  fetchAndStoreCities();
