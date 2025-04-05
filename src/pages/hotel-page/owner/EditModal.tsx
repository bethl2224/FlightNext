"use client";
import * as React from "react";
import { useState } from "react";
import "@pages/styles/globals.css";
import { apiURl } from "@/utils/hotel-query";
function EditModal({
  roomType,
  hotelId,
  currentCapacity,
}: {
  roomType: string;
  hotelId: number;
  currentCapacity: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCapacity, setNewCapacity] = useState<number>(currentCapacity);
  const [message, setMessage] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setMessage("");
  };

  const handleSaveChanges = async () => {
    setMessage("");

    const updateData = {
      hotelId: hotelId,
      roomType: roomType,
      roomCapacity: newCapacity,
    };

    try {
      const response = await fetch(`${apiURl}/hotel/owner/room-type`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("Capacity updated successfully:", result);
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
          className="absolute top-4 right-4 px-5 py-3 text-base bg-indigo-500 rounded cursor-pointer border-none text-neutral-50 hover:bg-indigo-600 transition-colors"
        >
          Edit Capacity
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white mb-10 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Edit Room Capacity</h2>
            <div className="relative mb-4">
              <label className="block text-sm text-slate-500 mb-1">
                New Capacity
              </label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="New capacity"
              />
            </div>
            <button
              onClick={handleSaveChanges}
              className="px-5 py-3 w-full text-center bg-indigo-500 rounded text-neutral-50 hover:bg-indigo-600 transition-colors"
            >
              Save Changes
            </button>
            <div className="text-center mt-2">
              {message === "Success" ? (
                <span className="text-green-500 font-bold">
                  Capacity updated successfully!
                </span>
              ) : message === "Error" ? (
                <span className="text-red-500 font-bold">
                  An error occurred.
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

export default EditModal;
