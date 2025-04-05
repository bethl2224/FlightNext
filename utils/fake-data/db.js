import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getUserByUsername(username, role) {
  try {
    const account = await prisma.account.findUnique({
      where: { username },
      include: {
        user: true,
        hotelOwner: true,
      },
    });

    console.log("sign in db", account);
    console.log(role)
    
    if (role === "user" && account.user) {
      return account;
    } else if (role === "owner" && account.hotelOwner) {
      return account;
    }
    return null;
  } catch {
    return null;
  }
}

// Example function to update a user by ID in the database
export async function updateUserById(userId, updates) {
  console.log("db", updates);
  console.log(userId);
  try {
    const updatedUser = await prisma.account.update({
      where: { id: userId },
      data: updates,
    });
    console.log("success line 25 db");
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const user = await prisma.account.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getLocationFromDatabase(location) {
  try {
    const locationData = await prisma.location.findMany({
      where: {
        OR: [
          { city: location },
          {
            airports: {
              some: {
                name: location,
              },
            },
          },
        ],
      },
      include: {
        airports: true,
      },
    });
    return locationData.length > 0 ? locationData[0].city : null;
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}
