import { NextResponse } from "next/server";
import { prisma } from "@/utils/db"; // Adjust the path as necessary
import { verifyToken } from "@/utils/auth"; // Adjust the path as necessary
import { customQueueMessage, addMessageQueue } from "@/utils/helper";
export async function DELETE(req) {
  try {
    const account = await verifyToken(req);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid Authentication" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { accountId: account.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const itineraryId = parseInt(searchParams.get("itineraryId"));
    const lastName = searchParams.get("lastName");
    const bookingReference = searchParams.get("bookingReference");

    if (!itineraryId || !lastName || !bookingReference) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (isNaN(itineraryId) || !Number.isInteger(itineraryId)) {
      return NextResponse.json(
        { error: "Invalid itinerary ID" },
        { status: 400 }
      );
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        flights: true,
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the user
    if (itinerary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to itinerary" },
        { status: 403 }
      );
    }

    const flight = itinerary.flights.find(
      (flight) =>
        flight.lastName === lastName &&
        flight.bookingReference === bookingReference
    );

    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // Delete the flight
    await prisma.flightInfo.delete({
      where: { lastName_bookingReference: { lastName, bookingReference } },
    });


        // Call the external API to cancel the flight
        const externalApiUrl = `${process.env.FLIGHT_URL}/api/bookings/cancel`;
        const apiKey = process.env.API_KEY;
    
        const response = await fetch(externalApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ lastName, bookingReference }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          return NextResponse.json(
            { error: "Failed to cancel flight via external API", details: errorData },
            { status: response.status }
          );
        }

        const data = await response.json();




    //Add delete flight message notification
    const flightData = { bookingReference: bookingReference };
    const message = await customQueueMessage(
      "Itinerary",
      account.id,
      null,
      flightData,
      "Flight-Delete"
    );

    await addMessageQueue("Itinerary", account.id, "USER", message);



    // Delete the itinerary if there are no more flights or hotel bookings
    if(itinerary.flights.length === 0 && itinerary.hotelBookings.length === 0){
      await prisma.itinerary.delete({
        where: { id: itineraryId },
      });


      const delete_itinerary = await customQueueMessage(
        "Itinerary",
        account.id,
        null,
        null,
        { itineraryId },
        "Itinerary-Delete"
      );
      await addMessageQueue("Itinerary", account.id, "USER", delete_itinerary);
      return NextResponse.json(
        { message: "Flight and Itinerary cancelled successfully", itinerary: delete_itinerary, data},
        { status: 200 }
      );
    }

    // Fetch the updated itinerary
    const updatedItinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        flights: true,
        hotelBookings: true,
      },
    });

    return NextResponse.json(
      { message: "Flight cancelled successfully", itinerary: updatedItinerary, data },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
