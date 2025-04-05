"use client";

import React from "react";
import Image from "next/image"; // Import Next.js Image component

const Footer: React.FC = () => {
  return (
    <footer className="py-4 mt-10 w-full bg-white max-md:max-w-full">
      <div className="flex flex-wrap gap-10 justify-between items-start px-32 pt-16 pb-6 w-full text-base text-slate-400 max-md:px-5 max-md:max-w-full">
        <Image
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/fe9879de125ab42be79f5d2e58445ab920526b59"
          width={200}
          height={82}
          className="object-contain shrink-0 aspect-[2.43]"
          alt="FlightNext logo"
        />

        <div className="py-4 pr-4 w-[200px]">
          <h3 className="flex-1 shrink gap-2.5 p-1 w-full text-lg font-bold whitespace-nowrap basis-0 text-slate-500">
            About
          </h3>
          <nav>
            <ul>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">About FlightNext</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">How it works</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Careers</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Press</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Blog</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Forum</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="py-4 pr-4 w-[200px]">
          <h3 className="flex-1 shrink gap-2.5 p-1 w-full text-lg font-bold whitespace-nowrap basis-0 text-slate-500">
            Partner with us
          </h3>
          <nav>
            <ul>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Partnership programs</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Affiliate program</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Connectivity partners</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Promotions and events</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Integrations</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Community</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Loyalty program</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="py-4 pr-4 w-[200px]">
          <h3 className="flex-1 shrink gap-2.5 p-1 w-full text-lg font-bold whitespace-nowrap basis-0 text-slate-500">
            Support
          </h3>
          <nav>
            <ul>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Help Center</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Contact us</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Privacy policy</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Terms of service</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                <a href="#">Trust and safety</a>
              </li>
              <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full whitespace-nowrap basis-0">
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-start w-[200px]">
          <div className="py-4 pr-4 w-full max-w-[250px]">
            <h3 className="flex-1 shrink gap-2.5 p-1 w-full text-lg font-bold basis-0 text-slate-500">
              Get the app
            </h3>
            <nav>
              <ul>
                <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                  <a href="#">FlightNext for Android</a>
                </li>
                <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                  <a href="#">FlightNext for iOS</a>
                </li>
                <li className="flex-1 shrink gap-2.5 p-1 mt-2 w-full basis-0">
                  <a href="#">Mobile site</a>
                </li>
              </ul>
            </nav>
          </div>
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/240a1d65c3237f3d6a25bd307755a4ff13475db0?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
            width={135}
            height={40}
            className="object-contain mt-3 max-w-full rounded aspect-[3.38]"
            alt="App Store"
          />
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e03953202ca8a4d228371b639f9633b03f8c7e92?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
            width={135}
            height={40}
            className="object-contain mt-3 max-w-full aspect-[3.38]"
            alt="Google Play"
          />
        </div>
      </div>

      <div className="mt-4 w-full bg-white max-md:max-w-full">
        <Image
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d8d15bccae4197e944f8ea700dab9e671ebbb356?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
          width={1000}
          height={1}
          className="object-contain z-10 w-full aspect-[1000] stroke-[1px] stroke-slate-300 max-md:max-w-full"
          alt="Divider"
        />
      </div>

      <div className="flex flex-wrap gap-10 justify-between items-center px-32 py-3 mt-4 w-full min-h-16 max-md:px-5 max-md:max-w-full">
        <div className="flex gap-5 items-start self-stretch p-2 my-auto">
          <a href="#">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e1ee4cf8ae6a3e59cb931250fff59863b17ce8d9?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
              width={24}
              height={24}
              className="object-contain shrink-0 aspect-square"
              alt="Social media"
            />
          </a>
          <a href="#">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b9f1dbd5aff369d84a04ed522fbcc208444100a0?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
              width={24}
              height={24}
              className="object-contain shrink-0 aspect-square"
              alt="Social media"
            />
          </a>
          <a href="#">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/0a738809e3d53029172396375d383da464060a3c?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010"
              width={24}
              height={24}
              className="object-contain shrink-0 aspect-square"
              alt="Social media"
            />
          </a>
        </div>
        <p className="self-stretch my-auto text-lg text-right text-slate-400">
          © 2025 FlightNext incorporated
        </p>
      </div>
    </footer>
  );
};

export default Footer;