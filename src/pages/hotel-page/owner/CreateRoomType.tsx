"use client";
import * as React from "react";
import { useState } from "react";
import "@pages/styles/globals.css";
import { apiURl } from "@/utils/hotel-query";

function CreateRoomType({ hotelId }: { hotelId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [amenities, setAmenities] = useState("");
  const [roomCapacity, setRoomCapacity] = useState<number>(1);
  const [file, setFile] = useState<File[]>([]);
  const [message, setMessage] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; // Get the first file from the FileList
      setFile([file]); // Replace the current file state with the new file
    }
  };

  const handleCreateRoomType = async () => {
    setMessage("");

    const formData = new FormData();
    formData.append("hotelId", hotelId.toString());
    formData.append("roomType", roomType);
    formData.append("pricePerNight", pricePerNight.toString());
    formData.append("amenities", amenities);
    formData.append("roomCapacity", roomCapacity.toString());
    if (file) {
      file.forEach((f) => formData.append("file", f));
    }

    try {
      const response = await fetch("/api/hotel/owner/room-type", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.status === 403) {
        setMessage("Permission Denied");
        return;
      }

      const result = await response.json();
      console.log("Room type created successfully:", result);
      setMessage("Success");
    } catch (error) {
      console.log(error);
      setMessage("Error");
    }
  };
  return (
    <>
      <div className="relative">
        <button
          onClick={toggleModal}
          className="absolute top-4 right-4 px-4 py-2 bg-indigo-500 rounded cursor-pointer border-none text-neutral-50 hover:bg-indigo-600 transition-color"
        >
          + Add Room Type
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]" // High z-index for modal
        >
          <div className="bg-white mb-10 p-6 rounded-lg shadow-lg max-w-lg w-full z-[10000]">
            <h2 className="text-xl font-bold mb-4">Create Room Type</h2>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                Room Type
              </label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Room type"
              />
            </div>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                Price Per Night
              </label>
              <input
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Price per night"
              />
            </div>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                Amenities
              </label>
              <input
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Amenities"
              />
            </div>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                Room Capacity
              </label>
              <input
                type="number"
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Room capacity"
              />
            </div>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="File upload"
              />
            </div>
            <button
              onClick={handleCreateRoomType}
              className="px-5 py-3 w-full text-center bg-green-500 rounded text-neutral-50 hover:bg-green-600 transition-colors"
            >
              Create Room Type
            </button>
            <div className="text-center mt-2">
              {message === "Success" ? (
                <span className="text-green-500 font-bold">
                  Room type created successfully!
                </span>
              ) : message === "Error" ? (
                <span className="text-red-500 font-bold">
                  An error occurred.
                </span>
              ) : message == "Permission Denied" ? (
                <span className="text-red-500 font-bold">
                  You do not have permission to perform this action.
                </span>
              ) : (
                ""
              )}
            </div>
            <button
              onClick={toggleModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateRoomType;
