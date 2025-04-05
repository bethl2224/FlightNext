import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import {
  checkHotelExist,
  checkHotelOwner,
  convertDate,
  countBookingRecordByHotelRoomType,
  addMessageQueue,
  customQueueMessage,
} from "@/utils/helper";
import { uploadFileToS3Hotel, process_img } from "@/utils/s3";
import { verifyToken } from "@/utils/auth";
// check missing required fields
// check create room ok

//GOOD!!✅
//As a hotel owner, I want to view room availability
// (per room type) for specific date ranges to
// better understand occupancy trends..

export async function GET(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const hotelId = parseInt(await request.nextUrl.searchParams.get("hotelId"));
    const roomType = await request.nextUrl.searchParams.get("roomType");
    const checkInDate = await request.nextUrl.searchParams.get("checkInDate");
    const checkOutDate = await request.nextUrl.searchParams.get("checkOutDate");
    console.log(hotelId, roomType, checkInDate, checkOutDate);

    if (!roomType || !hotelId) {
      return NextResponse.json(
        { error: "Please enter hotel id and room type" },
        { status: 400 }
      );
    }

    // console.log(checkHotelOwner(account.id, hotelId), "checkHotelOwner");

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelExist(hotelId))) {
      return NextResponse.json(
        { error: "Hotel does not exist" },
        { status: 404 }
      );
    }

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelOwner(account.id, hotelId))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const room = await prisma.hotelRoomType.findUnique({
      where: {
        hotelId_roomType: {
          roomType: roomType,
          hotelId: hotelId,
        },
      },
      include: {
        bookings: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 400 }
      );
    }

    const payload = {
      hotelId: hotelId,
      roomType: roomType,
    };

    // add date to query params

    if (checkInDate) {
      payload.checkInDate = convertDate(checkInDate);
    }

    if (checkOutDate) {
      payload.checkOutDate = convertDate(checkOutDate);
    }

    if (
      payload.checkInDate &&
      payload.checkOutDate &&
      payload.checkOutDate < payload.checkInDate
    ) {
      return NextResponse.json(
        { error: "Check out date cannot be earlier than check in date" },
        { status: 400 }
      );
    }

    //find the bookings within time range
    const numRoomAvailable = countBookingRecordByHotelRoomType(
      room,
      payload.checkInDate,
      payload.checkOutDate
    );

    return NextResponse.json(
      {
        hotelId: room.hotelId,
        roomType: room.roomType,
        amenities: room.amenities,
        pricePerNight: room.pricePerNight,
        roomCapacity: room.roomCapacity,
        numRoomAvailable: numRoomAvailable,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error details:", error.stack);

    return NextResponse.json(
      { error: "Failed to get room info" },
      { status: 500 }
    );
  }
}

//As a hotel owner, I want to update the number
// of available rooms of each type in my hotel.
// If availability decreases, it may require
// canceling some existing reservations. ✅

export async function PATCH(request) {
  const account = await verifyToken(request);
  if (!account) {
    return NextResponse.json(
      { error: "Invalid Authentication" },
      { status: 401 }
    );
  }

  try {
    const { roomType, hotelId, roomCapacity } = await request.json();

    console.log(hotelId, roomType, roomCapacity);
    if (
      !roomType ||
      roomCapacity === null ||
      roomCapacity === undefined ||
      !hotelId
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: roomType, roomCapacity, hotelId",
        },
        { status: 404 }
      );
    }

    if (!(await checkHotelExist(hotelId))) {
      return NextResponse.json(
        { error: "Hotel does not exist" },
        { status: 404 }
      );
    }

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelOwner(account.id, hotelId))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    console.log("line 139");

    const room = await prisma.hotelRoomType.findMany({
      where: { roomType: roomType, hotelId: hotelId },
    });
    if (room.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const updateRoom = await prisma.hotelRoomType.update({
      where: {
        hotelId_roomType: {
          // Replace `hotelId_roomType` with your actual composite key name
          hotelId: parseInt(hotelId),
          roomType: roomType,
        },
      },
      data: { roomCapacity: roomCapacity },
    });

    // check if the room capacity is less than the current booking
    const bookings = await prisma.hotelBookingRecord.findMany({
      where: {
        hotelId: hotelId,
        roomType: roomType,
      },
      orderBy: {
        createdAt: "desc", // Sort bookings by creation date in descending order
      },
    });

    // delete booking in descending order
    const numDeleteBooking = bookings.length - roomCapacity;
    if (numDeleteBooking > 0) {
      for (let i = 0; i < numDeleteBooking; i++) {
        const book = await prisma.hotelBookingRecord.delete({
          where: {
            id: bookings[i].id,
          },
        });

        const user = await prisma.user.findUnique({
          where: {
            id: book.userId,
          },
        });

        // send notification to user
        const message = await customQueueMessage(
          "HotelBookingRecord",
          user.accountId,
          account.id,
          book,
          "Delete"
        );

        await addMessageQueue(
          "HotelBookingRecord",
          user.accountId,
          "USER",
          message
        );
        console.log("FORCED DELETE BOOKING DUE TO ROOM CAPACITY");
        console.log("DELETED BOOKING: ", message);
      }
    }

    if (numDeleteBooking > 0) {
      await addMessageQueue(
        "HotelBookingRecord",
        account.id,
        "HOTEL-OWNER",
        `Automatically deleted ${numDeleteBooking} bookings due to room capacity change`
      );
    }

    // // TODO should we return the whole room information?

    return NextResponse.json(updateRoom, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to update room info" },
      { status: 500 }
    );
  }
}

// create a roomtype in specify hotel ✅

export async function POST(request) {
  const account = await verifyToken(request);
  if (!account) {
    return NextResponse.json(
      { error: "Invalid Authentication" },
      { status: 401 }
    );
  }

  try {
    const data = await request.formData();
    const hotelId = await data.get("hotelId");
    const roomType = await data.get("roomType");
    const amenities = await data.get("amenities");
    let pricePerNight = await data.get("pricePerNight");
    let roomCapacity = await data.get("roomCapacity");

    console.log(hotelId, roomType, amenities, pricePerNight, roomCapacity);
    const files = data.getAll("file");

    if (
      !hotelId ||
      !roomType ||
      !amenities ||
      !pricePerNight ||
      !roomCapacity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload = {
      hotelId: parseInt(hotelId),
      roomType: roomType,
      amenities: amenities,
      pricePerNight: parseFloat(pricePerNight),
      roomCapacity: parseInt(roomCapacity),
    };

    if (!(await checkHotelExist(payload.hotelId))) {
      return NextResponse.json(
        { error: "Hotel does not exist" },
        { status: 404 }
      );
    }

    //check if hotel owner is valid in modify the hotel resource
    if (!(await checkHotelOwner(account.id, payload.hotelId))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const roomTypeExist = await prisma.hotelRoomType.findUnique({
      where: {
        hotelId_roomType: {
          // Use composite key notation
          roomType: payload.roomType,
          hotelId: payload.hotelId,
        },
      },
    });

    // create room
    if (roomTypeExist) {
      return NextResponse.json(
        {
          error: `Room Type: \'${roomType}'\ already existed. Please specify another roomType`,
        },
        { status: 409 }
      );
    }

    const newRoom = await prisma.hotelRoomType.create({
      data: payload,
    });

    //add images to the S3 bucket
    let images;
    if (files) {
      images = await process_img(files, uploadFileToS3Hotel, "Hotel-Type");
    }
    const imageArr = [];

    // add multiple images to the room
    if (images) {
      for (const image of images) {
        console.log(image.imageUrl);
        const newImage = await prisma.hotelRoomImage.create({
          data: {
            hotelId: payload.hotelId,
            url: image.imageUrl,
            roomType: payload.roomType,
          },
        });

        imageArr.push(newImage);
      }
    }
    newRoom.images = imageArr;
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to create room. Please make sure to enter room info." },
      { status: 500 }
    );
  }
}
