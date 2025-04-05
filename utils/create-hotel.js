import { prisma } from "./db.js";
const hotelImages = [
  {
    a: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_1.jpg",
    b: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_1b.jpg",
  },
  {
    a: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_2.jpg",
    b: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_2b.jpg",
  },
  {
    a: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_3a.jpg",
    b: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_3b.jpg",
  },
  {
    a: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_7.jpg",
    b: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_8.jpg",
  },
  {
    a: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_8a.jpg",
    b: "https://webstorageflights.s3.ca-central-1.amazonaws.com/Hotels/hotel_image_9.jpg",
  },
  {
    a: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel1.jpg",
    b: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel2.png",
  },
  {
    a: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel3.jpg",
    b: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel4.jpg",
  },
  {
    a: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel5.jpg",
    b: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel6.jpg",
  },
  {
    a: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel7.jpg",
    b: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel8.jpg",
  },
  {
    a: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel9.png",
    b: "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/hotel-2/hotel9b.jpg",
  },
];
const hotelLogos = [
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo1.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo10.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo2.jpeg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo3.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo4.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo5.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo6.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo7.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo8.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/logo-2/logo9.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo11.webp",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo12.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo13.png",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo14.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo15.png",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo16.png",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo17.png",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo18.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo19.png",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Logo/logo20.jpg",
];

const locations = [
  { city: "New York", country: "United States" },
  { city: "Madrid", country: "Spain" },
  { city: "Beijing", country: "China" },
  { city: "Toronto", country: "Canada" },
  { city: "Sydney", country: "Australia" },
  { city: "Chicago", country: "United States" },
];

const hotelNames = [
  "The Grand Horizon",
  "Elysian Retreat",
  "Aurora Heights",
  "Celestial Stay",
  "Luxe Haven",
  "Serenity Suites",
  "Majestic View",
  "Tranquil Escape",
  "Opulent Oasis",
  "Radiant Resort",
  "Golden Sands Retreat",
  "Infinity Edge Resort",
  "Paradise Cove",
  "Starlight Haven",
  "Emerald Bay Hotel",
  "Velvet Sky Inn",
  "Crystal Waters Lodge",
  "Sunset Bliss",
  "Azure Peaks",
  "Dreamscape Villas",
];

const addresses = [
  "123 Broadway Ave",
  "456 Gran Via",
  "789 Forbidden Plaza",
  "101 Queen Street West",
  "202 Harbour Bridge Road",
  "303 Magnificent Mile",
  "404 Champs-Élysées",
  "505 Piccadilly Circus",
  "606 Shibuya Crossing",
  "707 Marina Bay Sands",
  "808 Copacabana Beach",
  "909 Table Mountain Road",
  "1010 Times Square",
  "1111 Hollywood Blvd",
  "1212 Bourbon Street",
  "1313 Red Square",
  "1414 Alexanderplatz",
  "1515 Piazza San Marco",
  "1616 Burj Khalifa Blvd",
  "1717 Federation Square",
];

async function main() {
  // Fetch the two hotel owners by their unique email addresses
  const owner1 = await prisma.account.findUnique({
    where: { email: "alice.johnson@example.com" },
    include: { hotelOwner: true },
  });

  const owner2 = await prisma.account.findUnique({
    where: { email: "bob.williams@example.com" },
    include: { hotelOwner: true },
  });

  if (!owner1 || !owner2) {
    console.error("Error: One or both hotel owners not found in the database.");
    process.exit(1);
  }

  const owners = [owner1, owner2];

  // Create 10 hotels (5 for each owner)
  for (let i = 0; i < 10; i++) {
    const owner = owners[i % 2]; // Alternate between the two owners
    const location = locations[i % locations.length]; // Alternate between the locations
    const hotelName = hotelNames[i % hotelNames.length];
    const logo = hotelLogos[i]; // Assign a distinct logo for each hotel
    const images = hotelImages[i % hotelImages.length];
    console.log(location.city, location.country);
    const createdHotel = await prisma.hotel.create({
      data: {
        name: hotelName,
        starRating: Math.floor(Math.random() * 5) + 1, // Random star rating between 1 and 5
        address: `${addresses[i]}`,
        logo: logo,
        images: {
          create: [{ url: images.a }, { url: images.b }],
        },
        owner: {
          connect: { id: owner.hotelOwner.id }, // Connect to the hotel owner
        },
        location: {
          connect: {
            city_country: { city: location.city, country: location.country },
          }, // Use composite key for location
        },
      },
    });

    console.log(
      `Created hotel: ${createdHotel.name} in ${location.city}, ${location.country} for owner: ${owner.firstName} ${owner.lastName}`
    );
  }

  console.log("All hotels created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
