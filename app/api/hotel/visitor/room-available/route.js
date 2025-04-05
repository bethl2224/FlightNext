import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { convertDate, countBookingRecordByHotelRoomType } from "@utils/helper";


// As a visitor, I want to view the availability
//  and details of different room types for my 
//  selected dates in a selected hotel.


export async function GET(request) {

    try{

    let hId = parseInt(await request.nextUrl.searchParams.get("hotelId"));
    let checkInDate = await request.nextUrl.searchParams.get("checkInDate");
    let checkOutDate = await request.nextUrl.searchParams.get("checkOutDate");

    if (!hId) {
        return NextResponse.json(
            { error: "Please enter hotel id" },
            { status: 400 }
        );
    }



    if (!checkInDate || !checkOutDate || checkInDate > checkOutDate){
        return NextResponse.json(
            { error: "Please enter valid check-in and check-out dates" },
            { status: 400 }
        );
    }
    hId = parseInt(hId);

    checkInDate = convertDate(checkInDate);
    checkOutDate = convertDate(checkOutDate);

    // include location, images, owner, roomTypes, users foreign keys 
    const hotelRoomType = await prisma.hotelRoomType.findMany({
        where: {
            hotelId: hId
        },
        include: {
            hotel: true,
            bookings: true
        }
    });
    const availableRooms = {}
    for (const roomTy of hotelRoomType){
        const count = await countBookingRecordByHotelRoomType(roomTy, checkInDate, checkOutDate);
        console.log(count, roomTy.roomCapacity);
        availableRooms[roomTy.roomType] = {
            roomType: roomTy.roomType,
            price: roomTy.pricePerNight,
            RoomAvailable: count,
      
        }
       
    }
    
    return NextResponse.json(availableRooms, {status: 200});
    }catch(error){
        console.log(error.stack);
        return NextResponse.json({error:"Unable to retrieve hotel"}, {status: 500});
    }

} 