import React, { useState, useEffect } from "react";
import "@pages/styles/globals.css";

const HotelModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<{ city: string; country: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
    logo: null as File | null,
    images: [] as File[],
    starRating: "",
    name: "",
  });

  useEffect(() => {
    if (!query) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ city: query });
        const response = await fetch(`/api/flights/cities?${params}`);
        if (response.ok) {
          const data = await response.json();
          setCities(data);
          setShowDropdown(true);
        } else {
          setCities([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuery(name === "city" ? value : query);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      if (name === "logo") {
        setFormData((prev) => ({ ...prev, logo: files[0] }));
      } else if (name === "images") {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...Array.from(files)],
        }));
      }
    }
  };
  const handleSubmit = async () => {
    console.log("Form Data Submitted:", formData);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("starRating", formData.starRating);
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }
      if (formData.images) {
        formData.images.forEach((image) => {
          formDataToSend.append("file", image);
        });
      }

      formDataToSend.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      const res = await fetch("api/hotel/user/create-hotel", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Hotel created successfully:", result);
        setIsOpen(false);
      } else {
        console.error("Error creating hotel:", res.statusText);
        alert("Error creating hotel");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating hotel:", error.stack);
      } else {
        console.error("Error creating hotel:", error);
      }
      alert("Error creating hotel");
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Hotel Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Hotel Details</h2>
            <form className="space-y-4">
              {/* Name */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">
                  Address:
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City Search */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">City:</label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={query}
                    onChange={handleInputChange}
                    className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-2 text-sm text-gray-500">
                          Loading...
                        </div>
                      ) : cities.length > 0 ? (
                        cities.map((cityObj, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setQuery(cityObj.city);
                              setFormData((prev) => ({
                                ...prev,
                                city: cityObj.city,
                                country: cityObj.country,
                              }));
                              setShowDropdown(false);
                            }}
                            className="p-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
                          >
                            {cityObj.city}, {cityObj.country}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          No cities found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">
                  Star Rating (0-5):
                </label>
                <input
                  type="number"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">
                  Country:
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Logo */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Logo:</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">
                  Images:
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelModal;
