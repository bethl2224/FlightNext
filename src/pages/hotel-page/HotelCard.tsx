import Image from "next/image";
import RoomTypeList from "./RoomTypeList";
import { RoomType } from "./visitor/HotelListings";
import CreateRoomType from "./owner/CreateRoomType";
interface HotelCardProps {
  images: string | string[]; // Accept a single image or an array of image URLs
  title: string; // Hotel name
  logo: string; // Hotel logo
  starRating: number; // Hotel star rating
  address: string; // Hotel address
  description: string; // Hotel description
  roomTypes: RoomType[]; // Array of room types
  startingPrice: number; // Starting price for the hotel
  altText: string; // Alt text for the images
  hotelId: number; // Unique ID for the hotel
  userRole?: "HOTEL-OWNER" | "VISITOR" | "USER"; // User role
}

const HotelCard: React.FC<HotelCardProps> = ({
  images,
  title,
  hotelId,
  description,
  starRating,
  address,
  logo,
  roomTypes,
  startingPrice,
  altText,
  userRole,
}) => {
  // Ensure images is always treated as an array for mapping
  const imageArray = (Array.isArray(images) ? images : [images]).filter(
    (image) => image !== ""
  ) as string[];

  return (
    <article className="flex gap-6 bg-white rounded-xl shadow-md w-full p-4 hover:shadow-lg transition-shadow max-md:flex-col">
      {/* Scrollable Image View and Starting Price */}
      <div className="flex flex-col items-center w-[400px] max-md:w-full">
        {/* Scrollable Image View */}
        {imageArray.length > 0 && imageArray[0] !== "" && (
          <div className="h-[300px] relative flex-shrink-0 overflow-x-auto whitespace-nowrap rounded-lg w-full">
            {imageArray.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="inline-block w-full h-full relative"
              >
                <Image
                  src={image}
                  alt={`${altText} - ${hotelId + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Define sizes for responsive behavior
                  priority
                  className="rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-start gap-5">
          {userRole == "HOTEL-OWNER" && <CreateRoomType hotelId={hotelId} />}

          {/* Starting Price Label */}
          <p className="text-lg font-semibold text-indigo-600 mt-4 text-left">
            Starting from ${startingPrice}
          </p>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="flex flex-col justify-between flex-grow">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <Image
            src={logo}
            alt={`${title} logo`}
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
        <div className="flex items-center mt-0.2">
          <span className="text-yellow-500 text-sm">
            {"★".repeat(starRating)}
          </span>
          <span className="text-gray-400 text-sm ml-2">{starRating} Stars</span>
        </div>

        <p className="text-sm text-gray-600 mt-2">{`StarRating: ${starRating}`}</p>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <p className="text-sm text-gray-600 mt-2">{`Address: ${address}`}</p>
        <RoomTypeList
          roomTypes={roomTypes}
          hotelId={hotelId}
          userRole={userRole}
        />

        {/* Starting Price and Scrollable View */}
        <div className="relative bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex items-center justify-between">
            {/* Scrollable Image View */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {imageArray.map((image, index) => (
                <div
                  key={`${hotelId}-${index}-hotellisting`}
                  className="relative w-32 h-32 flex-shrink-0 sm:w-40 sm:h-40 md:w-48 md:h-48"
                >
                  <Image
                    src={image}
                    alt={`${altText} - ${index + 1}`}
                    fill
                    sizes="(max-width: 800px) 100vw, (max-width: 1200px) 50vw, 33vw" // Define sizes for responsive behavior
                    className="object-cover rounded-lg shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
