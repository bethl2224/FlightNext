import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

// As a visitor, I want to view detailed hotel information, 
// including room types, amenities, and pricing.

// TODO just query by id
// somehow when user clicks on screen, we fetch hotel id

export async function GET(request) {

    try{

    const id= parseInt(await request.nextUrl.searchParams.get("id"));

    if (!id) {
        return NextResponse.json(
            { error: "Please enter hotel id" },
            { status: 400 }
        );
    }

    // include location, images, owner, roomTypes, users foreign keys 
    const hotel = await prisma.hotel.findUnique({
        where: { id: id },
        include: {
            location: true,
            images: true,
            owner: true,
            roomTypes: true,
            users: true
        }
    });
    
    return NextResponse.json({ hotel }, {status: 200});
    }catch(error){
        console.log(error.stack);
        return NextResponse.json({error:"Unable to retrieve hotel"}, {status: 500});
    }

} 