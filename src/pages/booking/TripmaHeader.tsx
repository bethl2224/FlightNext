"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component
import SignOut from "@pages/auth/SignOut";
interface HeaderProps {
  userRole: string;

  onUserRoleChange: (role: string) => void;
}



function TripmaHeader({ userRole, onUserRoleChange }: HeaderProps) {

  return (
    <header className="flex flex-wrap gap-10 justify-between items-center px-6 py-2 w-full text-base bg-white text-slate-400 max-md:px-5 max-md:max-w-full">
        <Image
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/fe9879de125ab42be79f5d2e58445ab920526b59"
                alt="Fly Next"
                width={120} // Set width for the logo
                height={120} // Set height for the logo
                className="h-[82px] cursor-pointer"
              />
      <nav
        className="flex flex-wrap gap-4 items-center self-stretch p-4 my-auto min-w-60 max-md:max-w-full"
        aria-label="Main navigation"
      >
        <Link
          href={`/flights/FlightTravel`}
          className="p-2.5 text-base no-underline text-slate-400"
        >
          Flight
        
        
        </Link>
        <Link
          href={`/hotel-page/${userRole}/HotelListings`}
          className="p-2.5 text-base no-underline text-slate-400"
        >
          Hotel
        </Link>
        <Link
          href={`/booking/Itinerary`}
          className="p-2.5 text-base no-underline text-slate-400"
        >
          Itinerary
        
        </Link>
        
        {/* Update Edit Profile link */}
        <>
          <Link
            href={`/${userRole}/EditProfile`}
            className="p-2.5 text-base no-underline text-slate-400"
          >
            Edit Profile
          </Link>
        </>

        <SignOut onLogout={() => onUserRoleChange("visitor")} />
      </nav>
    </header>
  );
};

export default TripmaHeader;
