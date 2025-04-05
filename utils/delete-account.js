import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const deletedUser = await prisma.account.delete({
      where: {
        id: 13,
      },
    });
    console.log("User deleted:", deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
