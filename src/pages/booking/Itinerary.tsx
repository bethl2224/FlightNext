"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation"; // For Next.js
import { useRouter } from "next/navigation"; // For redirection
import TripmaHeader from "@pages/main/Header";
import FlightSearch from "./FlightSearch";
import FlightCart from "./FlightCart";
import DestinationSection from "./DestinationSection";
import TripmaFooter from "@pages/main/Footer";
import "@pages/styles/globals.css";
import { useState, useEffect } from "react";
import { Flight } from "./FlightSearch";
import { Hotel_Room } from "./HotelSearchBar";
import HotelSearchBar from "./HotelSearchBar";
const Itinerary: React.FC = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, setUserRole] = useState<string>("visitor"); //account role

  const searchParams = useSearchParams(); // Get search parameters from the URL

  // State for form fields
  const [tripType, setTripType] = React.useState(
    searchParams?.get("flight_type") || "oneway"
  );
  const [startDate, setStartDate] = React.useState<Date | null>(
    searchParams?.get("date") ? new Date(searchParams.get("date")!) : null
  );
  const [endDate, setEndDate] = React.useState<Date | null>(
    searchParams?.get("round_trip_date")
      ? new Date(searchParams.get("round_trip_date")!)
      : null
  );

  // queries and suggestions
  const [departureQuery, setDepartureQuery] = React.useState(
    searchParams?.get("origin") || ""
  );
  const [arrivalQuery, setArrivalQuery] = React.useState(
    searchParams?.get("destination") || ""
  );
  const [departureSuggestions, setDepartureSuggestions] = React.useState<
    string[]
  >([]);
  const [arrivalSuggestions, setArrivalSuggestions] = React.useState<string[]>(
    []
  );

  // collapsable
  const [isFlightSearchVisible, setIsFlightSearchVisible] = useState(false); // State to toggle visibility
  const [isHotelBookingVisible, setIsHotelBookingVisible] = useState(false); // State to toggle hotel booking visibility
  // State for cart
  const [cart, setCart] = useState<Flight[]>([]);

  const [hotelCart, setHotelCart] = useState<Hotel_Room[]>([]);

  // Function to add a flight group to the cart
  const addFlightGroupToCart = (newFlights: Flight[]) => {
    // Check if any flight in the new group already exists in the cart
    const hasDuplicate = newFlights.some((newFlight) =>
      cart.some((existingFlight) => existingFlight.id === newFlight.id)
    );

    if (hasDuplicate) {
      alert("One or more flights in this group are already in the cart.");
      return; // Prevent adding duplicates
    }

    // Add the new flights to the cart
    setCart((prevCart) => [...prevCart, ...newFlights]);
  };
  // Function to remove a flight group from the cart
  const removeFlightGroupToCart = (flightGroup: Flight[]) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        // Check if the item is a flight and is not part of the flight group
        if ("flightNumber" in item) {
          return !flightGroup.includes(item);
        }
        // If the item is not a flight, keep it in the cart
        return true;
      })
    );
  };

  // Function to add a hotel to the cart
  const addHotelToCart = (hotel: Hotel_Room) => {
    setHotelCart((prevCart) => [...prevCart, hotel]);
  };

  // Function to remove a hotel from the cart
  const removeHotelFromCart = (hotel: Hotel_Room) => {
    setHotelCart((prevCart) =>
      prevCart.filter((item) => {
        // Check if the item is a hotel and matches the hotel to be removed
        if ("roomType" in item) {
          return item.roomType !== hotel.roomType;
        }
        // If the item is not a hotel, keep it in the cart
        return true;
      })
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPaymentInfoVisible, setIsPaymentInfoVisible] = useState(false); // New state for payment info visibility

  // State for payment and passport info
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [passportNumber, setPassportNumber] = useState<string>("");

  // Function to handle form submission
  const handlePaymentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditCardNumber || !passportNumber) {
      alert("Please fill in both credit card and passport numbers.");
      return;
    }
    alert("Payment and passport information submitted successfully!");
  };

  //fetch role one time
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/account/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user role");
        }
        const data = await res.json();
        const role = sessionStorage.getItem("role");
        if (data.role == "USER" && role == "user") {
          setUserRole("user");
          // a hotel owner is trying to access user page
        } else if (data.role == "HOTEL-OWNER" && role == "user") {
          setUserRole("user");
        } else {
          setUserRole("owner");
        }
      } catch {
        // then visitor, as no role is found
        setUserRole("visitor");
      }
    };
    fetchRole();
  }, []);
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });

        if (!response.ok) {
          console.error("Unauthorized access. Redirecting to sign-in page...");
          router.push("/"); // Redirect to sign-in page
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/signin"); // Redirect on error
      }
    };

    checkAuthentication();
  }, [router]);

  // Function to fetch flight data dynamically
  const fetchFlightData = React.useCallback(async () => {
    const origin = departureQuery.includes(",")
      ? departureQuery.split(",")[0].trim()
      : departureQuery.trim();
    const destination = arrivalQuery.includes(",")
      ? arrivalQuery.split(",")[0].trim()
      : arrivalQuery.trim();
    const formattedStartDate = startDate?.toISOString().split("T")[0];
    const formattedEndDate = endDate ? endDate.toISOString().split("T")[0] : "";

    const endpoint = `/api/flights/details?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&date=${formattedStartDate}&flight_type=${encodeURIComponent(
      tripType === "twoway" ? "round_trip" : tripType
    )}${
      tripType === "twoway" && endDate
        ? `&round_trip_date=${formattedEndDate}`
        : ""
    }`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!data || !data.results || data.results.length === 0) {
        alert("No Flights Found...");
      } else {
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "An unknown error occurred.");
    }
  }, [departureQuery, arrivalQuery, startDate, endDate, tripType]);

  // Trigger fetch when all required fields are filled or search params are not empty
  React.useEffect(() => {
    if (tripType === "oneway" && departureQuery && arrivalQuery && startDate) {
      fetchFlightData();
    } else if (
      tripType === "twoway" &&
      departureQuery &&
      arrivalQuery &&
      startDate &&
      endDate
    ) {
      fetchFlightData();
    }
  }, [
    departureQuery,
    arrivalQuery,
    startDate,
    endDate,
    tripType,
    fetchFlightData,
  ]);

  // Fetch suggestions for arrivalQuery
  React.useEffect(() => {
    if (arrivalQuery?.length > 0) {
      Promise.allSettled([
        fetch(`/api/flights/cities?city=${arrivalQuery}`).then((res) =>
          res.json()
        ),
        fetch(`/api/flights/airports?airport=${arrivalQuery}`).then((res) =>
          res.json()
        ),
      ])
        .then((results) => {
          const cities =
            results[0].status === "fulfilled" ? results[0].value : [];
          const airports =
            results[1].status === "fulfilled" ? results[1].value : [];
          const citySuggestions = Array.isArray(cities)
            ? cities
                .slice(0, 5)
                .map(
                  ({ city, country }: { city: string; country: string }) =>
                    `${city}, ${country}`
                )
            : [];
          const airportSuggestions = Array.isArray(airports)
            ? airports.slice(0, 5).map(({ name }: { name: string }) => name)
            : [];
          setArrivalSuggestions([...citySuggestions, ...airportSuggestions]);
        })
        .catch((err) =>
          console.error("Error fetching arrival suggestions:", err)
        );
    } else {
      setArrivalSuggestions([]);
    }
  }, [arrivalQuery]);

  // Fetch suggestions for departureQuery
  React.useEffect(() => {
    if (departureQuery?.length > 0) {
      Promise.allSettled([
        fetch(`/api/flights/cities?city=${departureQuery}`).then((res) =>
          res.json()
        ),
        fetch(`/api/flights/airports?airport=${departureQuery}`).then((res) =>
          res.json()
        ),
      ])
        .then((results) => {
          const cities =
            results[0].status === "fulfilled" ? results[0].value : [];
          const airports =
            results[1].status === "fulfilled" ? results[1].value : [];
          const citySuggestions = Array.isArray(cities)
            ? cities
                .slice(0, 5)
                .map(
                  ({ city, country }: { city: string; country: string }) =>
                    `${city}, ${country}`
                )
            : [];
          const airportSuggestions = Array.isArray(airports)
            ? airports.slice(0, 5).map(({ name }: { name: string }) => name)
            : [];
          setDepartureSuggestions([...citySuggestions, ...airportSuggestions]);
        })
        .catch((err) =>
          console.error("Error fetching departure suggestions:", err)
        );
    } else {
      setDepartureSuggestions([]);
    }
  }, [departureQuery]);

  // SavedCart
  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    const savedHotelCart = sessionStorage.getItem("hotelCart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedHotelCart) {
      setHotelCart(JSON.parse(savedHotelCart));
    }
  }, []);

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    const savedHotelCart = sessionStorage.getItem("hotelCart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedHotelCart) {
      setHotelCart(JSON.parse(savedHotelCart));
    }
  }, []);

  //handle next method
  const handleNext = async () => {
    try {
      // Validate passport number
      if (!passportNumber || passportNumber.trim() === "") {
        alert("Please enter your passport number before proceeding.");
        return;
      }

      if (
        (!cart || cart.length === 0) &&
        (!hotelCart || hotelCart.length === 0)
      ) {
        alert("Please add at least one flight or hotel to proceed.");
        return;
      }

      // Fetch user identity
      const userResponse = await fetch("/api/account/me");
      if (!userResponse.ok) {
        router.push("/user/Home");
        return;
      }
      const user = await userResponse.json();

      // Get the list of flight IDs from the cart
      const flightIds = cart.map((flight) => flight.id);

      // Construct the flights array (only one entry for user details)
      let flights = {};

      if (flightIds && flightIds.length > 0) {
        flights = [
          {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passportNumber: "000000000",
            flightIds: flightIds, // Include all flight IDs in a single array
          },
        ];
      }

      // Construct the hotelBookings array
      const hotelBookings = hotelCart.map((hotel) => ({
        creditCardInfo: creditCardNumber,
        checkInDate: hotel.checkInDate,
        checkOutDate: hotel.checkOutDate,
        roomType: hotel.roomType,
        hotelId: hotel.id,
      }));

      // Construct the final JSON object
      const itinerary = {
        flights,
        hotelBookings,
      };

      // alert(JSON.stringify(itinerary))

      // console.log("Constructed Itinerary:", itinerary);

      // Optionally, send the itinerary to the backend
      const itineraryResponse = await fetch("/api/bookings/user/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itinerary),
      });

      if (!itineraryResponse.ok) {
        const error = await itineraryResponse.json();
        alert(`Error: ${error.error}`);
        router.push("/booking/Itinerary");
        return;
      }

      const itineraryData = await itineraryResponse.json();

      // Store the itinerary ID
      const itineraryId = itineraryData.Itinerary.id;
      sessionStorage.setItem("itineraryId", itineraryId);

      // Redirect to the checkout page
      window.location.href = `/user-checkout?itineraryId=${itineraryId}`;
    } catch (error) {
      console.error("Error constructing itinerary:", error);
      alert("Failed to proceed to the next step. Please try again.");
    }
  };

  const handleSave = () => {
    // Save the cart and hotelCart to sessionStorage
    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("hotelCart", JSON.stringify(hotelCart));

    alert("Save successful!"); // Display a success message
  };

  return (
    <>
      <TripmaHeader />
      <main className="px-16 py-0 max-md:px-8" style={{ marginTop: "100px" }}>
        {/* Flex container for collapsible sections and Flight Cart */}
        <div className="flex gap-6">
          {/* Left Section: Collapsible Sections */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Payment and Passport Info Section */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Passport Info
              </h2>
              <form
                onSubmit={handlePaymentInfoSubmit}
                className="mt-4 flex flex-col gap-4"
              >
                <div>
                  <input
                    type="text"
                    id="passportNumber"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your passport number"
                  />
                </div>
              </form>
            </div>

            {/* Flight Search Section */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              {/* Collapsible Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Flight Search
                </h2>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  onClick={() =>
                    setIsFlightSearchVisible(!isFlightSearchVisible)
                  }
                >
                  {isFlightSearchVisible ? "Collapse" : "Expand"}
                </button>
              </div>

              {/* Collapsible Content */}
              {isFlightSearchVisible && (
                <div className="mt-4">
                  <FlightSearch
                    departureQuery={departureQuery}
                    setDepartureQuery={setDepartureQuery}
                    departureSuggestions={departureSuggestions}
                    setDepartureSuggestions={setDepartureSuggestions}
                    arrivalQuery={arrivalQuery}
                    setArrivalQuery={setArrivalQuery}
                    arrivalSuggestions={arrivalSuggestions}
                    setArrivalSuggestions={setArrivalSuggestions}
                    tripType={tripType}
                    setTripType={setTripType}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    addFlightGroupToCart={addFlightGroupToCart}
                  />
                </div>
              )}
            </div>

            {/* Hotel Booking Section */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              {/* Collapsible Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Hotel Booking
                </h2>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  onClick={() =>
                    setIsHotelBookingVisible(!isHotelBookingVisible)
                  }
                >
                  {isHotelBookingVisible ? "Collapse" : "Expand"}
                </button>
              </div>

              {/* Collapsible Content */}
              {isHotelBookingVisible && (
                <div className="mt-4">
                  <HotelSearchBar addHotelToCart={addHotelToCart} />
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Flight Cart */}
          <div className="w-1/3">
            <FlightCart
              cart={cart}
              hotelCart={hotelCart}
              removeHotelFromCart={removeHotelFromCart}
              removeFlightGroupToCart={removeFlightGroupToCart}
              handlenext={handleNext} // Call the function here
              onSave={handleSave}
            />
          </div>
        </div>
      </main>
      <DestinationSection />
      <TripmaFooter />
    </>
  );
};

export default Itinerary;
