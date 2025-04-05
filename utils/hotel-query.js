export async function fetchHotel() {
  try {
    const res = await fetch("/api/hotel/owner/get-hotel", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch hotels");
    }
    return res;
  } catch (error) {
    console.error("Error fetching hotels:", error);
  }
}

export const fetchAllRoomType = async () => {
  try {
    const response = await fetch(
      "/api/hotel/owner/filter-roomtype?roomType=All"
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching room types:", error);
  }
};

export const fetchRoomTypes = async () => {
  try {
    const response = await fetch("/api/hotel/owner/get-room-type");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching room types:", error);
  }
};
export const searchHotelInfo = async (searchData, role = "user") => {
  //handle hotel logic

  const { city, checkInDate, checkOutDate } = searchData;

  console.log("City:", city);
  console.log("Check-In Date:", checkInDate);
  console.log("Check-Out Date:", checkOutDate);

  if (!city || !checkInDate || (!checkOutDate && role != "owner")) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const queryParams = new URLSearchParams(searchData).toString();
    console.log(queryParams);
    const response = await fetch(`/api/hotel/visitor?${queryParams}`, {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Search results aggregated:", result);

      console.log("****************************");
      return result;
    } else {
      console.error("Failed to search hotels:", response.statusText);
    }
  } catch (error) {
    console.error("Error searching hotels:", error);
  }
};

export function aggregateHotelInfo(hotelData) {
  const aggregatedHotels = [];

  hotelData.forEach((hotel) => {
    // Check if the hotel already exists in the aggregatedHotels array
    const existingHotel = aggregatedHotels.find(
      (h) => h.hotelId === hotel.hotelId
    );

    if (existingHotel) {
      // If the hotel exists, add the roomType details to the existing hotel
      existingHotel.roomTypes.push({
        roomType: hotel.roomType,
        pricePerNight: hotel.pricePerNight,
        amenities: hotel.amenities,
        numRoomAvailable: hotel.numRoomAvailable,
        roomTypeImages: hotel.roomTypeImages,
      });
    } else {
      // If the hotel does not exist, create a new entry
      aggregatedHotels.push({
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        images: hotel.images,
        hotelId: hotel.hotelId,
        starRating: hotel.starRating,
        logo: hotel.logo,
        address: hotel.address,

        roomTypes: [
          {
            roomType: hotel.roomType,
            pricePerNight: hotel.pricePerNight,
            amenities: hotel.amenities,
            numRoomAvailable: hotel.numRoomAvailable,
            roomTypeImages: hotel.roomTypeImages,
          },
        ],
        altText: hotel.name,
      });
    }
  });

  // Calculate the starting price (minimum price) for each hotel
  aggregatedHotels.forEach((hotel) => {
    hotel.startingPrice = Math.min(
      ...hotel.roomTypes.map((room) => room.pricePerNight)
    );
  });

  return aggregatedHotels;
}

export async function searchAllMessage(accountid, queueType, role) {
  try {
    if (!accountid || !queueType) {
      return;
    }
    const params = new URLSearchParams({
      accountId: accountid,
      messageType: queueType,
      role: role, // TODO pass in role
    }).toString();
    const response = await fetch(`/api/notification?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accountid: accountid,
        queuetype: queueType,
      },
    });

    if (!response.ok) {
      console.log("Failed to fetch messages");
      return null;
    }
    const data = await response.json();

    // since we use id serial, we assume messages are from
    //newest to oldest
    if (!data || data.length === 0) {
      console.log("User or owner doesn't have any notification messages found");
      return [];
    }
    const messages = data.messages.map((message) => ({
      content: message.payload,
      id: message.id,
    }));

    console.log(messages);

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

export async function deleteMessage(messageId) {
  try {
    const response = await fetch("/api/notification", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId: messageId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete message");
    }

    console.log("Message deleted successfully");
    return await response.json();
  } catch (error) {
    console.error("Error deleting message:", error);
  }
}

export function validateDate(checkInDate, checkOutDate) {
  let checkInDateObj, checkOutDateObj;
  if (checkInDate) {
    const [year, month, day] = checkInDate.split("-");
    checkInDateObj = new Date(Date.UTC(year, month - 1, day));
  }
  if (checkOutDate) {
    const [year, month, day] = checkOutDate.split("-");
    checkOutDateObj = new Date(Date.UTC(year, month - 1, day));
  }

  const todayDateOnly = new Date(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    )
  );

  console.log("todayDateOnly", todayDateOnly);
  console.log("checkInDateObj", checkInDateObj);

  if (
    checkInDate &&
    checkInDateObj.getFullYear() == todayDateOnly.getFullYear() &&
    checkInDateObj.getMonth() == todayDateOnly.getMonth() &&
    checkInDateObj.getDate() == todayDateOnly.getDate()
  ) {
    return true;
  }

  if (checkInDate && checkInDateObj < todayDateOnly) {
    alert("Check-in date cannot be earlier than today.");
    return;
  }
  if (checkOutDate && checkOutDateObj < todayDateOnly) {
    alert("Check-out date cannot be earlier than today.");
    return;
  }

  if (checkInDate && checkOutDate && checkInDateObj > checkOutDateObj) {
    alert("Check-in date cannot be later than check-out date.");
    return;
  }

  return true;
}
