import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component
import SignInModal from "@pages/auth/SignIn";
import SignUpModal from "@pages/auth/SignUp";
import SignOutModal from "@pages/auth/SignOut";
import HotelModal from "@pages/hotel-page/HotelModal";
import { useEffect, useState } from "react";
import LikeList from "@pages/hotel-page/user/LikeList";
import NotificationModal from "@pages/main/Notification";

export interface LikeListItem {
  id: number;
  name: string;
  address: string;
}

function Header() {
  const [userRole, setUserRole] = useState<string>("visitor");
  const [userId, setUserId] = useState<number>(0);
  const [likeList, setLikeList] = useState<LikeListItem[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserRole("visitor"); // Reset user role to "visitor" after logout
    sessionStorage.clear(); // Clear role from local storage
  };

  // Fetch role one time
  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (!sessionStorage.getItem("role")) {
          setUserRole("visitor");
          return;
        }

        const res = await fetch("/api/account/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        });
        if (!res.ok) {
          setUserRole("visitor");
          return;
        }
        const data = await res.json();

        const role = sessionStorage.getItem("role");
        console.log("INITIAL ROLE", role);
        if (data.role == "USER" && role == "user") {
          setUserRole("user");
        } else if (data.role == "HOTEL-OWNER" && role == "user") {
          setUserRole("user");
        } else {
          setUserRole("owner");
        }
        setUserId(data.id);
      } catch {
        setUserRole("visitor");
      }
    };
    fetchRole();
  }, []);

  return (
    <header className="flex fixed top-0 justify-between items-center px-6 py-2 w-full h-24 bg-white z-[100]">
      {/* Logo */}
      <Link href="/">
        <Image
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/fe9879de125ab42be79f5d2e58445ab920526b59"
          alt="Fly Next"
          width={120}
          height={82}
          className="h-[82px] cursor-pointer"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex gap-4 items-center max-sm:hidden">
        {/* User Dropdown Menu */}
        {userRole === "user" && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="p-2.5 text-base no-underline text-slate-400 hover:text-slate-600"
            >
              User Menu
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                <Link
                  href="/my-bookings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  All Bookings
                </Link>

                <Link
                  href={`/hotel-page/${userRole}/Bookings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hotel Bookings
                </Link>
                <Link
                  href="/booking/Itinerary"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Book Itinerary
                </Link>

                <Link
                  href="/check-flights"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Check Flights
                </Link>

                <HotelModal />
              </div>
            )}
          </div>
        )}

        {/* Owner Dropdown Menu */}
        {userRole === "owner" && (
          <div className="relative">
            <button
              onClick={() => setIsOwnerMenuOpen((prev) => !prev)}
              className="p-2.5 text-base no-underline text-slate-400 hover:text-slate-600"
            >
              Owner Menu
            </button>
            {isOwnerMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                <Link
                  href={`/hotel-page/${userRole}/Bookings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Bookings
                </Link>
                <Link
                  href={`/hotel-page/${userRole}/HotelListings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hotel Listings
                </Link>

                <HotelModal />
              </div>
            )}
          </div>
        )}

        {/* Common Links */}
        <Link
          href="/flights/FlightTravel"
          className="p-2.5 text-base no-underline text-slate-400 hover:text-slate-600"
        >
          Flights
        </Link>
        <Link
          href={`/hotel-page/${userRole}/HotelListings`}
          className="p-2.5 text-base no-underline text-slate-400 hover:text-slate-600"
        >
          Hotels
        </Link>

        {/* Notifications */}
        {(userRole === "user" || userRole === "owner") && (
          <NotificationModal
            id={userId.toString()}
            queueType="HotelBookingRecord"
            role={userRole === "owner" ? "HOTEL-OWNER" : "USER"}
          />
        )}

        {/* Like List */}
        {userRole === "user" && (
          <LikeList
            likeList={likeList}
            onSetLikeList={setLikeList}
            userId={userId}
          />
        )}

        {/* Profile and Authentication */}
        {userRole === "user" || userRole === "owner" ? (
          <>
            <Link
              href={`/${userRole}/EditProfile`}
              className="p-2.5 text-base no-underline text-slate-400 hover:text-slate-600"
            >
              Edit Profile
            </Link>
            <SignOutModal onLogout={handleLogout} />
          </>
        ) : (
          <>
            <SignInModal />
            <SignUpModal />
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
