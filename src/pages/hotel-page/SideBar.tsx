import React from "react";
import PriceRangeSlider from "./PriceRangeSlider";
import StarRating from "./StarRating";
import { useState, useEffect } from "react";
import { apiURl } from "@/utils/hotel-query";
import { searchHotelInfo } from "@/utils/hotel-query";
interface SidebarProps {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  filters: {
    searchTerm: string;
    priceRange: [number, number];
    starRating: number;
  };
  onFilterChange: (filters: string) => void;
  onPriceChange: (priceRange: [number, number]) => void;
  onStarChange: (starRating: number) => void;
}
function Sidebar({
  city,
  checkInDate,
  checkOutDate,
  filters = { searchTerm: "", priceRange: [0, 1000], starRating: 0 }, // Default values
  onFilterChange,
  onStarChange,
  onPriceChange,
}: SidebarProps) {
  const [hotelList, setHotelList] = useState<
    { name: string; city: string; country: string }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false); // State to toggle dropdown visibility
  const [query, setQuery] = useState(""); // State to track the input value
  const [isLoading, setIsLoading] = useState(false); // State to show loading indicator

  // Fetch hotels from the API
  const fetchHotel = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (query) {
        const params = new URLSearchParams({ name: query });

        const response = await fetch(
          `${apiURl}/hotel/visitor/hotel-name?${params}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data, "****************");
          setHotelList(
            data.map(
              (hotel: { name: string; city: string; country: string }) => ({
                name: hotel.name,
                city: hotel.city,
                country: hotel.country,
              })
            )
          );
          setShowDropdown(true); // Show dropdown
        } else {
          setHotelList([]); // Clear cities if no results
          setShowDropdown(false);
        }
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setHotelList([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHotel(); // Call the fetch function
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [fetchHotel]);

  return (
    <div className="w-80 bg-white p-6 shadow-md flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search hotels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search hotels"
          />

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
              ) : hotelList.length > 0 ? (
                hotelList.map((HotelObj, index) => (
                  <div
                    key={index}
                    onMouseDown={() => {
                      onFilterChange(HotelObj.name); // Update the filter
                      searchHotelInfo({
                        city,
                        checkInDate,
                        checkOutDate,
                        name: HotelObj.name,
                      });
                      setQuery(HotelObj.name); // Update the input value
                      setShowDropdown(false); // Hide the dropdown
                    }}
                    className="p-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    {HotelObj.name}, {HotelObj.city}, {HotelObj.country}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-400">No Hotels found</div>
              )}
            </div>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm text-slate-500 mb-2">
            Price Range
          </label>
          <PriceRangeSlider
            value={filters.priceRange}
            onChange={(value: [number, number]) => {
              onPriceChange(value);
              const params: {
                city: string;
                checkInDate: string;
                checkOutDate: string;
                priceRangeStart?: number;
                priceRangeEnd?: number;
              } = {
                city: city,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
              };
              if (value[0] > 0) {
                params.priceRangeStart = value[0];
              }
              if (value[1] < 1000) {
                params.priceRangeEnd = value[1];
              }
              //fetch hotel api
              searchHotelInfo(params);
            }}
            min={0}
            max={1000}
          />
          <div className="flex justify-between mt-2 text-sm text-slate-500">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-500 mb-2">
            Star Rating
          </label>
          <StarRating value={filters.starRating} onChange={onStarChange} />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
