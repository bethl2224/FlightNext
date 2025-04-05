import { prisma } from "./db.js";
import bcrypt from "bcryptjs";

async function main() {
  // Hash the passwords
  const hashedPasswordUser = await bcrypt.hashSync(
    "password123",
    parseInt(process.env.BCRYPT_ROUNDS)
  );
  const hashedPasswordOwner1 = await bcrypt.hashSync(
    "password123",
    parseInt(process.env.BCRYPT_ROUNDS)
  );
  const hashedPasswordOwner2 = await bcrypt.hashSync(
    "password123",
    parseInt(process.env.BCRYPT_ROUNDS)
  );

  // Create 1 regular user
  const user = await prisma.account.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      profilePicture: null,
      phoneNumber: "123-456-7890",
      email: "john.doe@example.com",
      username: "johndoe",
      password: hashedPasswordUser, // Save hashed password
      role: "USER", // Regular user role
      user: {
        create: {}, // Create the linked User model
      },
    },
  });
  console.log(`Created user: ${user.firstName} ${user.lastName}`);

  // Create 2 hotel owners
  const owner1 = await prisma.account.create({
    data: {
      firstName: "Alice",
      lastName: "Johnson",
      profilePicture: null,
      phoneNumber: "555-123-4567",
      email: "alice.johnson@example.com",
      username: "alicejohnson",
      password: hashedPasswordOwner1, // Save hashed password
      role: "HOTEL-OWNER", // Owner role
      user: {
        create: {}, // Create the linked User model
      },
      hotelOwner: {
        create: {}, // Create the linked HotelOwner model
      },
    },
  });
  console.log(`Created hotel owner: ${owner1.firstName} ${owner1.lastName}`);

  const owner2 = await prisma.account.create({
    data: {
      firstName: "Bob",
      lastName: "Williams",
      profilePicture: null,
      phoneNumber: "555-987-6543",
      email: "bob.williams@example.com",
      username: "bobwilliams",
      password: hashedPasswordOwner2, // Save hashed password
      role: "HOTEL-OWNER", // Owner role
      user: {
        create: {}, // Create the linked User model
      },
      hotelOwner: {
        create: {}, // Create the linked HotelOwner model
      },
    },
  });
  console.log(`Created hotel owner: ${owner2.firstName} ${owner2.lastName}`);

  console.log("All accounts created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
