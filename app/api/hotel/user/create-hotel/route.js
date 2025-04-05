import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { uploadFileToS3Hotel, process_img } from "@/utils/s3";

export async function POST(request) {
  try {
    const account = await verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const name = data.get("name");
    let logo = data.get("logo");
    const address = data.get("address");
    const city = data.get("city");
    const country = data.get("country");
    const starRating = data.get("starRating");
    const files = data.getAll("file");

    if (!name || !logo || !address || !city || !country || !starRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //helper for testing
    // deleteHotel(name);
    // deleteHotelOwner(account.id);

    //add logo to s3 bucket and retrieve the url
    logo = (await process_img(logo, uploadFileToS3Hotel, "Hotel-logo"))[0]
        .imageUrl;
    let newHotel = await prisma.hotel.create({
      data: {
        name: name,
        logo: logo,
        address: address,
        city: city,
        country: country,
        starRating: parseInt(starRating),
      },
    });

    // Fetch the user's role from the database
    const userAccount = await prisma.account.findUnique({
      where: {
        id: account.id,
      },
      select: {
        role: true,
      },
    });

    // Check both the account and user role
    if (account.role === "USER" && userAccount.role == "USER") {
      //create new hotel owner
      console.log("line 49");
      let newOwner = await prisma.hotelOwner.create({
        data: {
          accountId: account.id, // Use account ID as it is unique
        },
      });

      if (newOwner) {
        console.log("existing owner", newOwner);
      } else {
        newOwner = await prisma.hotelOwner.create({
          data: {
            accountId: account.id, //we can use account id as it is unique
          },
        });
      }
      //Add owner id
      const updatedOwner = await prisma.hotelOwner.update({
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

      // Update the hotel with the ownerId
      newHotel = await prisma.hotel.update({
        where: {
          id: newHotel.id,
        },
        data: {
          ownerId: updatedOwner.id,
        },
      });
    }

    else {
    
      // if account is already hotel owner
      const updatedOwner = await prisma.hotelOwner.update({
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

      console.log("line 130")

      // Update the hotel with the ownerId
      newHotel = await prisma.hotel.update({
        where: {
          id: newHotel.id,
        },
        data: {
          ownerId: updatedOwner.id,
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

    // Create images for the hotel
    let images;
    if (files) {
      images = await process_img(files, uploadFileToS3Hotel, "Hotel");
      const imageArr = [];

      for (const image of images) {
        console.log(image.imageUrl);
        const newImage = await prisma.hotelImage.create({
          data: {
            url: image.imageUrl,
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
    }

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
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to create hotel" },
      { status: 500 }
    );
  }
}
