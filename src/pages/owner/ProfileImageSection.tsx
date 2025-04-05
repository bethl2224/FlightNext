'use client';

import React, { useState } from "react";
import Image from "next/image";

interface ProfileImageSectionProps {
  profilePicture: string | File; // Can be a File or a URL
  onFileChange: (file: File) => void; // Callback for file upload
  onRemoveImage: () => void; // Callback for removing the image
  imageIsChanged: (isChanged: boolean) => void; // Callback to notify if the image has been changed
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  profilePicture,
  onFileChange,
  onRemoveImage,
  imageIsChanged,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file); // Notify parent about the uploaded file
      imageIsChanged(true); // Notify parent that the image has been changed
    }
    setIsModalOpen(false); // Close the modal
  };

  const handleRemoveImage = () => {
    onRemoveImage(); // Notify parent to remove the image
    imageIsChanged(true); // Notify parent that the image has been changed
  };

  const getImageSrc = () => {
    if (profilePicture instanceof File) {
      return URL.createObjectURL(profilePicture); // Temporary URL for File
    }
    return profilePicture; // URL string
  };

  return (
    <section className="mb-10 w-[200px]">
      {/* Profile Picture */}
      <figure className="overflow-hidden mb-4 rounded-full border-2 border-solid border-gray-300 h-[200px] w-[200px]">
        {profilePicture ? (
          <Image
            src={getImageSrc()} // Use the getImageSrc function to handle both File and URL
            alt="Profile avatar"
            className="object-cover rounded-full"
            width={200}
            height={200}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-500">
            No Image
          </div>
        )}
      </figure>

      {/* Change Photo Button */}
      <button
        className="px-4 py-2 ml-7 text-base text-indigo-500 rounded border border-indigo-500"
        onClick={() => setIsModalOpen(true)}
      >
        Change Photo
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Profile Photo</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
              <button
                className="px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileImageSection;