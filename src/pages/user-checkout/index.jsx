import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@pages/main/Header";
import Footer from "@pages/main/Footer";
import {useRouter} from "next/router";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CheckoutPage = () => {

  const router = useRouter();
  const [itinerary, setItinerary] = useState(null);

  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

    // Error states for validation
    const [creditCardError, setCreditCardError] = useState("");
    const [expiryDateError, setExpiryDateError] = useState("");
    const [cvvError, setCvvError] = useState("");
    const [billingAddressError, setBillingAddressError] = useState("");
    const [flightDetails, setFlightDetails] = useState(null)

  const searchParams = useSearchParams();
  const itineraryId = searchParams.get("itineraryId");


  const [totalFlightPrice, setTotalFlightPrice] = useState(0);
  const [totalHotelPrice, setTotalHotelPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [taxesAndFees, setTaxesAndFees] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Initialize values from sessionStorage
  useEffect(() => {
    const storedBreakdown = sessionStorage.getItem("totalAmountBreakdown");
    if (storedBreakdown) {
      const {
        totalFlightPrice,
        totalHotelPrice,
        subtotal,
        taxesAndFees,
        total,
      } = JSON.parse(storedBreakdown);

      setTotalFlightPrice(totalFlightPrice || 0);
      setTotalHotelPrice(totalHotelPrice || 0);
      setTotalPrice(subtotal || 0);
      setTaxesAndFees(taxesAndFees || 0);
      setFinalTotal(total || 0);
    }
  }, []);
  
  const validateExpiryDate = (expiryDate) => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{4}$/; // MM/YYYY format
    if (!expiryRegex.test(expiryDate)) {
      return false; // Invalid format
    }
  
    const [month, year] = expiryDate.split("/").map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
    const currentYear = currentDate.getFullYear();
  
    // Check if the expiry date is in the past
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false; // Expired
    }
  
    return true; // Valid expiry date
  };
  

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/bookings/user/itinerary/${itineraryId}`);
        if (!response.ok) {
          alert("Failed to fetch itinerary details");
          router.push("/")
        }
        const data = await response.json();
        setItinerary(data);
      } catch (error) {
        console.error("Error fetching itinerary:", error);
      }
    };

    if (itineraryId) {
      fetchItinerary();
    }
  }, [itineraryId]);

  // Validate credit card number
  useEffect(() => {
    const creditCardRegex = /^[0-9]{16}$/; // 16-digit credit card number
    if (creditCardNumber && !creditCardRegex.test(creditCardNumber)) {
      setCreditCardError("Please enter a valid 16-digit credit card number.");
    } else {
      setCreditCardError("");
    }
  }, [creditCardNumber]);

  // Validate expiry date
  useEffect(() => {
    if (expiryDate && !validateExpiryDate(expiryDate)) {
      setExpiryDateError("Please enter a valid expiry date in MM/YYYY format.");
    } else {
      setExpiryDateError("");
    }
  }, [expiryDate]);

  // Validate CVV
  useEffect(() => {
    const cvvRegex = /^[0-9]{3,4}$/; // 3 or 4-digit CVV
    if (cvv && !cvvRegex.test(cvv)) {
      setCvvError("Please enter a valid 3 or 4-digit CVV.");
    } else {
      setCvvError("");
    }
  }, [cvv]);

  // Validate billing address
  useEffect(() => {
    if (billingAddress && !billingAddress.trim()) {
      setBillingAddressError("Please enter a valid billing address.");
    } else {
      setBillingAddressError("");
    }
  }, [billingAddress]);

  const fetchFlightInfo = async (lastName, bookingReference, itineraryId) => {
    try {
      const response = await fetch(
        `/api/bookings/user/flights-info?lastName=${lastName}&bookingReference=${bookingReference}&itineraryId=${itineraryId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch flight info for Last Name: ${lastName}, Booking Reference: ${bookingReference}, Itinerary ID: ${itineraryId}`
        );
      }
      const flightData = await response.json();
      console.log("Fetched Flight Data:", flightData);
      return flightData;
    } catch (error) {
      console.error("Error fetching flight info:", error);
      return null; // Return null if the fetch fails
    }
  };



  

  useEffect(() => {
    let flights = sessionStorage.getItem("flightDetails");
    if (flightDetails) {
      setFlightDetails(JSON.parse(flights));
      console.log(flightDetails)
      console.log("Flight Details:", JSON.parse(flightDetails));
    }
  }, []);


  const handleConfirmBooking = async () => {
    // Validate fields before proceeding
    const creditCardRegex = /^[0-9]{16}$/; // 16-digit credit card number
    const cvvRegex = /^[0-9]{3,4}$/; // 3 or 4-digit CVV
  
    let isValid = true;
  
    // Validate credit card number
    if (!creditCardRegex.test(creditCardNumber)) {
      setCreditCardError("Please enter a valid 16-digit credit card number.");
      isValid = false;
    } else {
      setCreditCardError("");
    }
  
    // Validate expiry date
    if (!validateExpiryDate(expiryDate)) {
      setExpiryDateError("Please enter a valid expiry date in MM/YYYY format.");
      isValid = false;
    } else {
      setExpiryDateError("");
    }
  
    // Validate CVV
    if (!cvvRegex.test(cvv)) {
      setCvvError("Please enter a valid 3 or 4-digit CVV.");
      isValid = false;
    } else {
      setCvvError("");
    }
  
    // Validate billing address
    if (!billingAddress.trim()) {
      setBillingAddressError("Please enter a valid billing address.");
      isValid = false;
    } else {
      setBillingAddressError("");
    }
  
    // If any field is invalid, stop execution
    if (!isValid) {
      alert("Please fix the errors before confirming the booking.");
      return;
    }
  
    try {
      // Call the endpoint to update the credit card info
      const response = await fetch(
        `/api/bookings/user/credit?itineraryId=${itineraryId}&creditCardNumber=${creditCardNumber}`,
        {
          method: "PUT",
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update credit card information.");
      }
  
      // If all validations pass
      alert("Booking confirmed successfully!");
  
      // Generate PDF Invoice
      const doc = new jsPDF();
     
      // Add title
      doc.setFontSize(18);
      doc.text("Trip Booking Invoice", 105, 20, { align: "center" });
    
      doc.setFontSize(12);
   // Add payment details
let yPosition = 80; // Start position for payment details
doc.text("Payment Details:", 20, yPosition);
yPosition += 10; // Add spacing
doc.text(`Credit Card Number: ${creditCardNumber.replace(/\d{12}/, "************")}`, 30, yPosition);
yPosition += 10; // Add spacing
doc.text(`Expiry Date: ${expiryDate}`, 30, yPosition);
yPosition += 10; // Add spacing
doc.text(`CVV: ***`, 30, yPosition); // Mask the CVV for security
yPosition += 10; // Add spacing
doc.text(`Billing Address: ${billingAddress}`, 30, yPosition);
yPosition += 20; // Add extra spacing before the next section

// Add flight details if they exist
if (itinerary.flights && itinerary.flights.length > 0) {
  doc.text("Flight Details:", 20, yPosition);
  yPosition += 10; // Add spacing
  for (const flight of itinerary.flights) {
    const flightData = await fetchFlightInfo(
      flight.lastName,
      flight.bookingReference,
      itineraryId
    );
    if (flightData) {
      yPosition += 10; // Add spacing
      doc.text(`First Name: ${flightData.firstName}`, 30, yPosition);
      yPosition += 10; // Add spacing
      doc.text(`Last Name: ${flightData.lastName}`, 30, yPosition);
      yPosition += 10; // Add spacing
      doc.text(`Booking Reference: ${flightData.bookingReference}`, 30, yPosition);
      yPosition += 10; // Add spacing
      doc.text(`Flight Number: ${flightData.agencyId}`, 30, yPosition);
      yPosition += 10; // Add spacing
      doc.text(`Passport Number: ${flightData.passportNumber}`, 30, yPosition);
      yPosition += 10; // Add spacing
      doc.text(`Ticket Number: ${flightData.ticketNumber}`, 30, yPosition);
      yPosition += 10;
      doc.text(`Status: ${flightData.status}`, 30, yPosition);
      yPosition += 10;

       // Check if the content exceeds the page height
 if (yPosition > 280) { // Assuming A4 page height is 297mm, leave some margin
  doc.addPage(); // Add a new page
  yPosition = 20; // Reset yPosition for the new page
}

    

      for(const flightInfo of flightData.flights){
         // Check if the content exceeds the page height
        doc.text(`Arrival: ${new Date(flightInfo.arrivalTime).toLocaleString()}`, 30, yPosition);
        yPosition += 10; // Add spacing
        doc.text(`Duration: ${flightInfo.duration} minutes`, 30, yPosition);
        yPosition += 10; // Add spacing
        doc.text(`Origin: ${flightInfo.origin.name} (${flightInfo.origin.code})`, 30, yPosition);
        yPosition += 10; // Add spacing
        doc.text(`Destination: ${flightInfo.destination.name} (${flightInfo.destination.code})`, 30, yPosition);
        yPosition += 10; // Add spacing
        doc.text(`Status: ${flightInfo.status}`, 30, yPosition);
        yPosition += 20; // Add extra spacing before the next flight

      }

       // Check if the content exceeds the page height
 if (yPosition > 280) { // Assuming A4 page height is 297mm, leave some margin
  doc.addPage(); // Add a new page
  yPosition = 20; // Reset yPosition for the new page
}

     
    }
  }
}
// Add hotel details if they exist
if (itinerary.hotelBookings && itinerary.hotelBookings.length > 0) {
   // Check if the content exceeds the page height

  doc.text("Hotel Details:", 20, yPosition);
  yPosition += 10; // Add spacing
  itinerary.hotelBookings.forEach((hotel, index) => {
    doc.text(`Hotel ${index + 1}:`, 20, yPosition);
    yPosition += 10; // Add spacing
    doc.text(`  Hotel Name: ${hotel.hotelName}`, 30, yPosition);
    yPosition += 10; // Add spacing
    doc.text(`  Room Type: ${hotel.roomType}`, 30, yPosition);
    yPosition += 10; // Add spacing
    doc.text(`  Check-In: ${new Date(hotel.checkInDate).toLocaleDateString()}`, 30, yPosition);
    yPosition += 10; // Add spacing
    doc.text(`  Check-Out: ${new Date(hotel.checkOutDate).toLocaleDateString()}`, 30, yPosition);
    yPosition += 20; // Add extra spacing before the next hotel
  });
}
 // Check if the content exceeds the page height
 if (yPosition > 280) { // Assuming A4 page height is 297mm, leave some margin
  doc.addPage(); // Add a new page
  yPosition = 20; // Reset yPosition for the new page
}

doc.text("Price Breakdown:", 20, yPosition);
yPosition += 10; // Add spacing
doc.text(`Flight Price: $${itinerary.priceBreakdown.flightPrice}`, 30, yPosition);
yPosition += 10; // Add spacing
doc.text(`Hotel Price: $${itinerary.priceBreakdown.hotelPrice}`, 30, yPosition);
yPosition += 10; // Add spacing
doc.text(`Taxes and Fees: $${itinerary.priceBreakdown.taxesAndFees}`, 30, yPosition);
yPosition += 10; // Add spacing
doc.text(`Total: $${itinerary.priceBreakdown.total}`, 30, yPosition);
  
      // Save the PDF
      doc.save("Trip_Booking_Invoice.pdf");
    // Simulate booking confirmation

      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("hotelCart");
      router.push("/user/Home")
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("An error occurred while confirming the booking. Please try again.");
    }
  };
  if (!itinerary) {
    return <div>Loading...</div>;
  }
 
  const handleCancelBooking = async () => {
    try {
      // Retrieve the itinerary ID from session storage
      const itineraryId = sessionStorage.getItem("itineraryId");
  
      if (!itineraryId) {
        alert("No itinerary found to cancel.");
        return;
      }
  
      // Send a DELETE request to cancel the itinerary
      const response = await fetch(`/api/bookings/user/itinerary/${itineraryId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to cancel the itinerary.");
      }

       // Remove cart and hotelCart from sessionStorage
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("hotelCart");
  
      alert("Itinerary canceled successfully.");
      // Redirect to the home page
      router.push("/user/Home");
    } catch (error) {
      console.error("Error canceling itinerary:", error);
      alert("An error occurred while canceling the itinerary. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-page p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Checkout</h1>

        {/* Itinerary Details */}
        <div className="itinerary-details mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Itinerary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flights Section */}
            {itinerary.flights.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6 border border-purple-300">
                <h3 className="text-lg font-bold mb-4 text-purple-700">Flights</h3>
                {itinerary.flights.map((flight, index) => (
                  <div key={index} className="mb-4">
                    <p><strong>Last Name:</strong> {flight.lastName}</p>
                    <p><strong>First Name:</strong> {flight.bookingInfo.firstName}</p>
                    <p><strong>Booking Reference:</strong> {flight.bookingReference}</p>
                    <p><strong>Ticket Number:</strong> {flight.bookingInfo.ticketNumber}</p>
                    <p><strong>Passport Number:</strong> {flight.bookingInfo.passportNumber}</p>


                    {/* Flights Section */}
    {flight.bookingInfo.flights.length > 0 && (
      <div   style={{
        maxHeight: "200px", // Adjust the height as needed
        overflowY: "auto", // Enable vertical scrolling
        border: "1px solid #ccc", // Add a light gray border
        padding: "10px", // Add some padding inside the box
        borderRadius: "8px", // Optional: Add rounded corners
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: Add a subtle shadow
      }}>
        {flight.bookingInfo.flights.map((flight, index) => (
          <div key={index} className="mb-4">
            <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
            <p><strong>Departure Time:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
            <p><strong>Arrival Time:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> {flight.duration} minutes</p>
            <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
            <p><strong>Airline:</strong> {flight.airline.name} ({flight.airline.code})</p>
            <p><strong>Origin:</strong> {flight.origin.name} ({flight.origin.code}), {flight.origin.city}, {flight.origin.country}</p>
            <p><strong>Destination:</strong> {flight.destination.name} ({flight.destination.code}), {flight.destination.city}, {flight.destination.country}</p>
            <hr className="border-t border-gray-300 my-4" />
            
          </div>
        ))}
      </div>
    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hotel Bookings Section */}
            {itinerary.hotelBookings.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6 border border-purple-300">
                <h3 className="text-lg font-bold mb-4 text-purple-700">Hotel Bookings</h3>
                {itinerary.hotelBookings.map((hotel, index) => {
                  const nights = Math.ceil(
                    (new Date(hotel.checkOutDate) - new Date(hotel.checkInDate)) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={index} className="mb-4">
                      <p><strong>Hotel Name:</strong> {hotel.hotelName}</p>
                      <p><strong>Room Type:</strong> {hotel.roomType}</p>
                      <p><strong>Check-In Date:</strong> {new Date(hotel.checkInDate).toLocaleDateString()}</p>
                      <p><strong>Check-Out Date:</strong> {new Date(hotel.checkOutDate).toLocaleDateString()}</p>
                      <p><strong>Total Nights:</strong> {nights}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Payment Details */}
        <div className="payment-details mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Payment Details</h2>
          <div className="bg-white shadow-md rounded-lg p-6 border border-purple-300">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-medium mb-2 text-purple-700">Credit Card Number</label>
  <input
    type="text"
    value={creditCardNumber}
    onChange={(e) => setCreditCardNumber(e.target.value)}
    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
      creditCardError ? "border-red-500 focus:ring-red-500" : "border-purple-300 focus:ring-purple-500"
    }`}
    placeholder="123456789234"
  />
  {creditCardError && <p className="text-red-500 text-sm mt-1">{creditCardError}</p>}
</div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700">Expiry Date</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    expiryDateError ? "border-red-500 focus:ring-red-500" : "border-purple-300 focus:ring-purple-500"
                  }`}
                  placeholder="MM/YYYY"
                />
                {expiryDateError && <p className="text-red-500 text-sm mt-1">{expiryDateError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    cvvError ? "border-red-500 focus:ring-red-500" : "border-purple-300 focus:ring-purple-500"
                  }`}
                  placeholder="123"
                />
                {cvvError && <p className="text-red-500 text-sm mt-1">{cvvError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700">Billing Address</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    billingAddressError ? "border-red-500 focus:ring-red-500" : "border-purple-300 focus:ring-purple-500"
                  }`}
                  placeholder="123 Main St, City, Country"
                />
                {billingAddressError && <p className="text-red-500 text-sm mt-1">{billingAddressError}</p>}
              </div>
            </form>
          </div>
        </div>

            {/* Price Breakdown */}
    <div className="price-breakdown bg-white shadow-md rounded-lg p-6 border border-purple-300">
      <h2 className="text-2xl font-semibold mb-4 text-purple-600">Price Breakdown</h2>
      <div className="flex justify-between items-center">
        <p className="text-lg font-medium text-gray-700">Flight Price:</p>
        <p className="text-lg font-semibold text-gray-900">${itinerary.priceBreakdown.flightPrice}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-medium text-gray-700">Hotel Price:</p>
        <p className="text-lg font-semibold text-gray-900">${itinerary.priceBreakdown.hotelPrice}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-medium text-gray-700">Subtotal:</p>
        <p className="text-lg font-semibold text-gray-900">${itinerary.priceBreakdown.subtotal}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-medium text-gray-700">Taxes and Fees:</p>
        <p className="text-lg font-semibold text-gray-900">${itinerary.priceBreakdown.subtotal}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-medium text-gray-700">Total:</p>
        <p className="text-lg font-semibold text-gray-900">${itinerary.priceBreakdown.total}</p>
      </div>
    </div>
     {/* Confirm Booking Button */}
        <div className="text-center">
            {/* Cancel Flight Button */}
  <button
    onClick={handleCancelBooking}
    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
  >
    Cancel Booking
  </button>
          <button
            onClick={handleConfirmBooking}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Confirm Booking
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;