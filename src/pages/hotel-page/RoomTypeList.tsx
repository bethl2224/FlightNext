import React from "react";
import { RoomType } from "./visitor/HotelListings";
import Image from "next/image";
import BookingModal from "@pages/hotel-booking/hotel-booking";
import EditModal from "./owner/EditModal";

interface RoomTypeListProps {
  roomTypes: RoomType[]; // Array of room types
  // Callback for the "View More" button
  hotelId: number;
  userRole?: "HOTEL-OWNER" | "VISITOR" | "USER"; // User role
}

const handleLike = async (hotelId: number) => {
  try {
    const response = await fetch("/api/hotel/user/add-hotel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: hotelId }), // Replace with actual room ID or data
    });
    console.log("**************");
    console.log(hotelId);
    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log("API Response:", data);
      alert("Save to Hotel Favorites!");
    } else {
      console.error("Failed to like the room");
      alert("Failed to like the room");
    }
  } catch (error) {
    console.error("Error liking the room:", error);
    alert("An error occurred while liking the room");
  }
};

export const RoomTypeList: React.FC<RoomTypeListProps> = ({
  roomTypes = [],
  hotelId,
  userRole,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {roomTypes.map((room, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {/* Room Info */}
          <div>
            <div className="flex items-cente justify-between">
              {/* Room Type */}
              <h3 className="text-lg font-semibold text-gray-800">
                {room.roomType}
              </h3>

              {/* Like Button */}
              {userRole === "USER" && (
                <button
                  className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                  onClick={() => handleLike(hotelId)}
                  aria-label="Like"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600">
              Price per night:{" "}
              <span className="font-medium">${room.pricePerNight}</span>
            </p>
            <p className="text-sm text-gray-600">
              Rooms available:{" "}
              <span className="font-medium">{room.numRoomAvailable}</span>
            </p>
            <p className="text-sm text-gray-600">
              Amenities: <span className="font-medium">{room.amenities}</span>
            </p>
            <div className="mt-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {room.roomTypeImages.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative w-32 h-32 flex-shrink-0 sm:w-40 sm:h-40 md:w-48 md:h-48"
                  >
                    <Image
                      src={image}
                      alt={`${room.roomType} image ${imgIndex + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Define sizes for responsive behavior
                      className="object-cover rounded-lg shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 
          { View More Button }
          <button
            onClick={() => BookNow(room)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Book Now
          </button>
       </div>
      ))} 

          
      
      */}
          {userRole === "HOTEL-OWNER" && (
            <EditModal
              hotelId={hotelId}
              roomType={room.roomType}
              currentCapacity={room.numRoomAvailable}
            />
          )}

          {userRole === "USER" && (
            <BookingModal hotelId={hotelId} roomType={room.roomType} />
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomTypeList;
