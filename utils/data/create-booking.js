import { signInAndGetToken } from "./create-hotel.js";
import { roomTypePayload, user_credentials } from "./generate-user.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const generateRandomCreditCardNumbers = () => {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
};

const generateRandomDate = () => {
  const randomCheckInDate = new Date(
    2025,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  )
    .toISOString()
    .slice(0, 10); // Extracts yyyy-mm-dd format

  const randomCheckOutDate = new Date(
    new Date(randomCheckInDate).getTime() +
      Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10); // Extracts yyyy-mm-dd format

  return [randomCheckInDate, randomCheckOutDate];
};

async function findAllHotelOwner() {
  const owners = await prisma.hotelOwner.findMany({
    include: {
      hotel: true,
      account: true,
    },
  });

  console.log(owners);

  const res = owners.map((owner) => {
    return {
      username: owner.account.username,
      password: user_credentials[owner.account.username],
      hotelId: owner.hotel.map((hotel) => hotel.id),
    };
  });

  return res;
}

//create roomtype by iterating hotel owners' hotel

const owners = await findAllHotelOwner();

for (const owner of owners) {
  const matchingRoomTypePayload = roomTypePayload
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  for (const roomType of matchingRoomTypePayload) {
    await createRoomType(
      roomType,
      owner.username,
      owner.password,
      owner.hotelId[Math.floor(Math.random() * owner.hotelId.length)]
    );
  }
}

async function createRoomType(el, username, password, hotelId) {
  const [accessToken, refreshToken] = await signInAndGetToken(
    username,
    password,
    "owner"
  );
  console.log("Access Token:", accessToken);

  // Create a FormData object
  const formData = new FormData();
  formData.append("accessToken", accessToken);
  formData.append("refreshToken", refreshToken);

  // Assuming `el` contains the room type data
  formData.append("hotelId", hotelId);
  formData.append("roomType", el.roomType);
  formData.append("amenities", el.amenities);
  formData.append("pricePerNight", el.pricePerNight.toString());
  formData.append("roomCapacity", el.roomCapacity.toString());
  formData.append("file", Array.isArray(el.file) ? el.file : [el.file]);
  // Send the POST request
  const response = await fetch(
    `http://localhost:3000/api/hotel/owner/room-type-2`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`, // Pass the JWT token as Bearer
        Cookie: [
          `accessToken=${accessToken}; Path=/; HttpOnly`,
          `refreshToken=${refreshToken}; Path=/; HttpOnly`,
        ].join("; "), // Send cookies in the Cookie header
      },

      body: formData, // Send the FormData object as the request body
      credentials: "include", // Automatically include cookies
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create room type: ${response.statusText} (${response.status})`
    );
  }

  const data = await response.json();
  return data;
}

// function generatePayload() {
//   const randomRoomType =
//     randomRoom[Math.floor(Math.random() * randomRoom.length)];
//   const hotelIdsFromRoomTypes = randomRoom.map((room) => room.hotelId);
//   const roomTypesFromRoomTypes = randomRoom.map((room) => room.roomType);

//   const [randomCheckInDate, randomCheckOutDate] = generateRandomDate();
//   const randomCreditCardNumbers = generateRandomCreditCardNumbers();

//   const bookingData = {
//     hotelId: hotelIdsFromRoomTypes,
//     checkInDate: randomCheckInDate,
//     checkOutDate: randomCheckOutDate,
//     creditCardInfo: randomCreditCardNumbers,
//     roomType: roomTypesFromRoomTypes, //TODO
//   };
//   return bookingData;
// }

// for (let i = 0; i < 20; i++) {
//   const randomUser = users[Math.floor(Math.random() * users.length)];
//   const bookingData = generatePayload();
//   const [accessToken, refreshToken] = await signInAndGetToken(
//     randomUser.username,
//     randomUser.password,
//     "user"
//   );
//   console.log("Access Token:", accessToken);
//   console.log("Refresh Token:", refreshToken);

//   const response = await fetch(
//     `http://localhost:3000/api/hotel/user/room-booking`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//         Cookie: [
//           `accessToken=${accessToken}; Path=/; HttpOnly`,
//           `refreshToken=${refreshToken}; Path=/; HttpOnly`,
//         ].join("; "),
//       },
//       body: JSON.stringify(bookingData),
//     }
//   );
//   const data = await response.json();

//   console.log(data);
// }
