import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export function convertDate(dateString) {
  return new Date(
    Date.UTC(
      parseInt(dateString.substring(0, 4)), // Year
      parseInt(dateString.substring(5, 7)) - 1, // Month (zero-indexed)
      parseInt(dateString.substring(8, 10)) // Day
    )
  );
}

export function caseSensitiveSearch(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function countBookingRecordByHotelRoomType(
  hotelRoomType,
  checkInDate,
  checkOutDate
) {
  let count = 0;
  console.log("line 23", hotelRoomType);
  console.log("line24", hotelRoomType.roomCapacity);
  if (!hotelRoomType?.bookings) {
    console.log("No booking records\n");
    return hotelRoomType.roomCapacity;
  }

  for (const bookingRecord of hotelRoomType.bookings) {
    if (
      bookingRecord.checkInDate >= checkInDate &&
      bookingRecord.checkOutDate <= checkOutDate
    ) {
      console.log(checkInDate, bookingRecord.checkInDate);
      console.log(checkOutDate, bookingRecord.checkOutDate);
      count++;
    }
  }
  console.log(`⭐️ Available rooms ${hotelRoomType.roomCapacity - count} ⭐️`);

  return hotelRoomType.roomCapacity - count;
}

export async function deleteHotel(name) {
  const prisma = new PrismaClient();
  try {
    // Delete related records first
    await prisma.hotelImage.deleteMany({
      where: {
        hotel: {
          name: name,
        },
      },
    });

    const d = await prisma.hotel.deleteMany({
      where: { name: name },
    });
    console.log(`⭐ Total Account with name ${name} deleted: ${d.count} ⭐`);
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    );
  }
}

export async function deleteHotelOwner(id) {
  try {
    await prisma.hotelOwner.delete({
      where: { accountId: id },
    });
  } catch (error) {
    console.log(error.stack);
    return false;
  }
  return true;
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: { accountId: id },
    });
  } catch (error) {
    console.log(error.stack);
    return false;
  }
  return true;
}
export async function checkHotelExist(id) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: id },
  });
  return hotel !== null;
}

export async function checkHotelOwner(id, hotelId) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { owner: true },
  });

  console.log(hotel.owner, "id", id);

  return hotel !== null && hotel.owner && hotel.owner.accountId === id;
}

export async function addMessageQueue(name, accountId, role, message) {
  //check if message queue exists

  try {
    const messageQueue = await prisma.messageQueue.findUnique({
      where: { name: name },
    });
    let queue;
    if (!messageQueue) {
      //create message queue if it does not exist
      queue = await prisma.messageQueue.create({
        data: {
          name: name,
          messages: {
            create: {
              accountId: accountId,
              role: role,
              payload: message,
            },
          },
        },
      });
    } else {
      //update message queue if it exists
      queue = await prisma.messageQueue.update({
        where: { name: name },
        data: {
          messages: {
            create: {
              accountId: accountId,
              role: role,
              payload: message,
            },
          },
        },
      });
    }
    console.log(
      `⭐--- Message added to queue: ${queue.name}---⭐ \n [messages: ${message}]\n[accountId: ${accountId}]`
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to add message to queue" },
      { status: 500 }
    );
  }
}

export async function customQueueMessage(
  queueType,
  accountId,
  ownerId = null,
  payload,
  operation
) {
  try {
    console.log(
      "⭐️ Custom Queue Message ⭐️\n" + "queueType",
      queueType,
      "\naccountId",
      accountId,
      "\nownerId",
      ownerId,
      "\nbookingRecord",
      payload,
      "\noperation",
      operation
    );

    let account;
    if (accountId) {
      account = await prisma.account.findUnique({
        where: { id: accountId },
      });
    }

    let owner;

    if (ownerId) {
      owner = await prisma.account.findUnique({
        where: { id: ownerId },
      });
    }

    if (queueType === "HotelBookingRecord") {
      //notify hotel owner of new booking
      if (operation === "Create") {
        return `New Booking ${payload.id} from ${account.email}`;
      }

      if (operation === "User-Create") {
        return `You successfuly create Booking ${payload.id}`;
      }
      // notify user of booking cancellation
      if (operation === "Delete") {
        return `Your Booking '${payload.id}' was cancelled by hotel owner ${owner.email}`;
      }

      if (operation === "User-Delete") {
        return `Hotel Booking '${payload.id}' was cancelled by user ${account.email}`;
      }
      if (operation === "User-cancelled") {
        return `Your Hotel Booking '${payload.id}' was successfully cancelled`;
      }
    }

    if (queueType === "Itinerary") {
      if (operation === "Update") {
        return "Itinerary updated by " + account.email;
      }
      if (operation === "Create") {
        return `New Itinerary created by ${account.email} `;
      }
      if (operation === "Flight-Delete") {
        return `Flight: ${payload.bookingReference} was deleted by ${account.email} `;
      }

      if (operation === "HotelBooking-Delete") {
        return `Hotel Booking '${payload.id}' was deleted by ${account.email} `;
      }
    }
    // Default case for other queueType values
    return `Operation ${operation} for queue type ${queueType} by ${account.email}`;
  } catch (error) {
    console.log(error.stack);
    return;
  }
}
