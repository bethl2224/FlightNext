import { apiURl } from "./hotel-query";

async function deleteBookingOwner(bookingid) {
  try {
    const res = await fetch(
      "/api/hotel/owner/room-booking?bookingId=${bookingid}",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    alert(`Booking ${bookingid} deleted successfully`);

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error deleting booking:", error);
  }
}

async function deleteBookingUser(bookingid) {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/hotel/user/room-booking`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ bookingId: parseInt(bookingid) }),
        "Content-Type": "application/json",
      }
    );

    alert(`User booking ${bookingid} deleted successfully`);

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error deleting user booking:", error);
  }
}

export { deleteBookingOwner, deleteBookingUser };
