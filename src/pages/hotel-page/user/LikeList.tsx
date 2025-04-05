"use client";
import { useEffect, useState } from "react";
export interface LikeListItem {
  id: number;
  name: string;
  address: string;
}
function LikeList({
  likeList,
  onSetLikeList,
  userId,
}: {
  likeList: LikeListItem[];
  onSetLikeList: React.Dispatch<React.SetStateAction<LikeListItem[]>>;
  userId: number;
}) {
  // const [likeList, setLikeList] = useState<
  //   { id: number; name: string; address: string }[]
  // >([]);

  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const fetchLikeList = async () => {
      try {
        const response = await fetch("/api/hotel/user/get-hotel", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          onSetLikeList(data);
        } else {
          console.error("Failed to fetch like list:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching like list:", error);
      }
    };
    fetchLikeList();
  }, [userId, reloadTrigger, onSetLikeList]);

  const handleRemoveHotel = async (hotelId: number) => {
    try {
      const response = await fetch("/api/hotel/user/delete-hotel", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ hotelId }),
      });

      if (response.ok) {
        alert("Hotel removed from favorites!");
        const updatedLikeList = likeList.filter(
          (hotel) => hotel.id !== hotelId
        );
        onSetLikeList(updatedLikeList); // Update the like list state
        setReloadTrigger((prev) => !prev); // Toggle the reload trigger
      } else {
        console.error("Failed to remove hotel:", response.statusText);
      }
    } catch (error) {
      console.error("Error removing hotel:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Show Favorites
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h1 className="text-2xl font-bold mb-4">Your Favorite Hotels</h1>
            <div className="grid grid-cols-1 gap-4">
              {likeList.map(
                (hotel: { id: number; name: string; address: string }) => (
                  <div
                    key={hotel.id}
                    className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {hotel.id}
                      </h3>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {hotel.name}
                      </h3>
                      <p className="text-sm text-gray-500">{hotel.address}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveHotel(hotel.id)}
                      className="ml-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )
              )}
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LikeList;
