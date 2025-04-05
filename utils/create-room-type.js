import { prisma } from "./db.js";
const roomTypes = [
  "Standard Room",
  "Deluxe Room",
  "Suite",
  "Family Room",
  "Single Room",
  "Double Room",
  "Executive Suite",
  "Presidential Suite",
  "Penthouse",
  "Studio Apartment",
];

const roomImages = [
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_1.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_10.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_2.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_3.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_4.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_5.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_6.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_7.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_8.jpg",
  "https://webstorageflights.s3.ca-central-1.amazonaws.com/Room-Type/room_image_9.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room10a.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room10b.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room1a.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room1b.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room2a.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room2b.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room2c.png",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room2d.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room5.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room7.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room7a..jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room7b.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room8a.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room9a.jpg",
  "https://app-web-storage.s3.us-east-2.amazonaws.com/Hotel/room-2/room9b.jpg",
];

async function main() {
  const hotels = await prisma.hotel.findMany(); // Fetch all hotels

  for (const hotel of hotels) {
    const numberOfRoomTypes = Math.floor(Math.random() * 2) + 2; // Randomly assign 2-3 room types
    const assignedRoomTypes = new Set(); // Track assigned room types for this hotel

    for (let i = 0; i < numberOfRoomTypes; i++) {
      let roomType;

      // Ensure the room type is unique for this hotel
      do {
        roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      } while (assignedRoomTypes.has(roomType));

      assignedRoomTypes.add(roomType); // Mark this room type as assigned

      const images = roomImages.slice(i * 2, i * 2 + 2); // Assign 2 images per room type

      await prisma.hotelRoomType.create({
        data: {
          roomType: roomType,
          pricePerNight: Math.floor(Math.random() * 200) + 100, // Random price between $100 and $300
          roomCapacity: Math.floor(Math.random() * 4) + 1, // Random capacity between 1 and 4
          amenities: "WiFi, TV, Air Conditioning", // Example amenities
          hotel: {
            connect: { id: hotel.id }, // Connect to the hotel
          },
          images: {
            create: images.map((url) => ({ url })), // Create room images
          },
        },
      });

      console.log(`Created room type: ${roomType} for hotel: ${hotel.name}`);
    }
  }

  console.log("All room types created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
