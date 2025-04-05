import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";

export async function POST(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const { name, logo, address, city, country, starRating, file } =
      await request.json();
    let updatedOwner;

    let newHotel = await prisma.hotel.create({
      data: {
        name: name,
        logo: logo,
        address: address,
        city: city,
        country: country,
        starRating: starRating,
      },
    });

    if (account.role === "USER") {
      //create new hotel owner
      let newOwner = await prisma.hotelOwner.create({
        data: {
          accountId: account.id, // Use account ID as it is unique
        },
      });

      // Add owner ID to the hotelOwner
      updatedOwner = await prisma.hotelOwner.update({
        where: {
          id: newOwner.id,
        },
        data: {
          hotel: {
            connect: {
              id: newHotel.id,
            },
          },
        },
      });

      // Change account role to HOTEL-OWNER
      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          role: "HOTEL-OWNER",
        },
      });
    } else {
      updatedOwner = await prisma.hotelOwner.update({
        where: {
          accountId: account.id,
        },
        data: {
          hotel: {
            connect: {
              id: newHotel.id,
            },
          },
        },
      });
    }

    // Update the hotel with the ownerId for both new and existing owners
    newHotel = await prisma.hotel.update({
      where: {
        id: newHotel.id,
      },
      data: {
        ownerId: updatedOwner.id,
      },
    });

    const imageArr = [];

    for (const image of file) {
      const newImage = await prisma.hotelImage.create({
        data: {
          url: image,
          hotel: {
            connect: {
              id: newHotel.id,
            },
          },
        },
      });
      imageArr.push(newImage);
    }
    newHotel.images = imageArr;

    // Fetch the hotel info with images
    const hotelInfo = await prisma.hotel.findUnique({
      where: {
        id: newHotel.id,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(hotelInfo, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create hotel" },
      { status: 500 }
    );
  }
}
