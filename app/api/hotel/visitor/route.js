import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { convertDate, countBookingRecordByHotelRoomType } from "@/utils/helper";
import { aggregateHotelInfo } from "@/utils/hotel-query";
//As a visitor, I want to search for hotels by check-in date,
// check-out date, and city. I also want to filter them by name,
//  star-rating, and price range. Search results should display
// in a list that shows the hotel information, starting price,
//  and a location pinpoint on
// a map. The results should only reflect available rooms.

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let starRating = searchParams.get("starRating");
    let priceRangeStart = searchParams.get("priceRangeStart");
    let priceRangeEnd = searchParams.get("priceRangeEnd");
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const city = searchParams.get("city");
    const name = searchParams.get("name");
    console.log("***************");
    console.log(searchParams);

    if (
      priceRangeStart &&
      priceRangeEnd &&
      parseFloat(priceRangeStart) > parseFloat(priceRangeEnd)
    ) {
      return NextResponse.json(
        { error: "Invalid price range" },
        { status: 400 }
      );
    }

    if (!checkInDate && !checkOutDate) {
      return NextResponse.json(
        { error: "Please enter city and check-in and check-out dates" },
        { status: 400 }
      );
    }

    if (!checkInDate && !checkOutDate) {
      return NextResponse.json(
        { error: "Please enter check-in and check-out dates" },
        { status: 400 }
      );
    }
    const checkInDateObj = convertDate(checkInDate);
    const checkOutDateObj = convertDate(checkOutDate);
    if (checkInDateObj > checkOutDateObj) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 }
      );
    }

    // start building payload for filtering

    const payload = {};

    if (city) {
      payload.city = city;
    }

    //optional starRating, , name, priceRangeStart, priceRangeEnd filtering
    if (starRating) {
      payload.starRating = parseInt(starRating);
    }

    if (name) {
      payload.name = name;
    }

    const priceRange = {};
    if (priceRangeStart && !isNaN(parseFloat(priceRangeStart))) {
      priceRange.gte = parseFloat(priceRangeStart);
    }
    if (priceRangeEnd && !isNaN(parseFloat(priceRangeEnd))) {
      priceRange.lte = parseFloat(priceRangeEnd);
    }

    let hotels;

    hotels = await prisma.hotel.findMany({
      where: payload,
      include: {
        location: true,
        images: true,
        owner: true,
        users: true,
        roomTypes: {
          include: {
            bookings: true,
            images: true,
          },
        },
      },
    });

    if (Object.keys(priceRange).length > 0) {
      console.log("Price Range:", priceRange);
      console.log("Hotels Before Filtering:", hotels);

      // Ensure priceRange values are numbers
      priceRange.gte =
        priceRange.gte !== undefined ? parseFloat(priceRange.gte) : undefined;
      priceRange.lte =
        priceRange.lte !== undefined ? parseFloat(priceRange.lte) : undefined;

      hotels = hotels
        .map((hotel) => {
          // Filter roomTypes within the price range
          const filteredRoomTypes = hotel.roomTypes.filter((roomType) => {
            const price = parseFloat(roomType.pricePerNight); // Ensure price is a number
            console.log("Room Type Price:", price);
            return (
              //only return room type
              (priceRange.gte === undefined || price >= priceRange.gte) &&
              (priceRange.lte === undefined || price <= priceRange.lte)
            );
          });

          // Return the hotel with filtered roomTypes
          return { ...hotel, roomTypes: filteredRoomTypes };
        })
        .filter((hotel) => hotel.roomTypes.length > 0); // Exclude hotels with no roomTypes
    }

    const res = [];
    for (const hotel of hotels) {
      for (const hotelRoomType of hotel.roomTypes) {
        // console.log(hotelRoomType.bookings);
        const availableRooms = countBookingRecordByHotelRoomType(
          hotelRoomType,
          checkInDateObj,
          checkOutDateObj
        );
        console.log("available room", availableRooms);
        if (availableRooms <= 0) {
          continue;
        }

        res.push({
          name: hotel.name,
          hotelId: hotel.id,
          starRating: hotel.starRating,
          logo: hotel.logo,
          address: hotel.address,
          roomType: hotelRoomType?.roomType,
          pricePerNight: hotelRoomType.pricePerNight,
          amenities: hotelRoomType.amenities,
          numRoomAvailable: availableRooms,
          city: hotel.location.city,
          country: hotel.location.country,
          roomTypeImages: hotelRoomType.images.map((image) => image.url),
          images: hotel.images.map((image) => image.url),
        });
      }
    }

    return NextResponse.json(aggregateHotelInfo(res), { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Unable to retrieve hotel" },
      { status: 500 }
    );
  }
}
