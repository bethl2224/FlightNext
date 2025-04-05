-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePicture" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelOwner" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "HotelOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelRoomType" (
    "roomType" TEXT NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "amenities" TEXT NOT NULL,
    "roomCapacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "HotelRoomType_pkey" PRIMARY KEY ("hotelId","roomType")
);

-- CreateTable
CREATE TABLE "HotelBookingRecord" (
    "id" SERIAL NOT NULL,
    "creditCardInfo" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "roomType" TEXT NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "userId" INTEGER,
    "itineraryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelBookingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "HotelImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelRoomImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,

    CONSTRAINT "HotelRoomImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightInfo" (
    "lastName" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "itineraryId" INTEGER NOT NULL,

    CONSTRAINT "FlightInfo_pkey" PRIMARY KEY ("lastName","bookingReference")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("city","country")
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageQueue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "messageQueueId" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HotelToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HotelToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelOwner_accountId_key" ON "HotelOwner"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_code_key" ON "Airport"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MessageQueue_name_key" ON "MessageQueue"("name");

-- CreateIndex
CREATE INDEX "_HotelToUser_B_index" ON "_HotelToUser"("B");

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_city_country_fkey" FOREIGN KEY ("city", "country") REFERENCES "Location"("city", "country") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "HotelOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelOwner" ADD CONSTRAINT "HotelOwner_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomType" ADD CONSTRAINT "HotelRoomType_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBookingRecord" ADD CONSTRAINT "HotelBookingRecord_hotelId_roomType_fkey" FOREIGN KEY ("hotelId", "roomType") REFERENCES "HotelRoomType"("hotelId", "roomType") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBookingRecord" ADD CONSTRAINT "HotelBookingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBookingRecord" ADD CONSTRAINT "HotelBookingRecord_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelImage" ADD CONSTRAINT "HotelImage_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomImage" ADD CONSTRAINT "HotelRoomImage_hotelId_roomType_fkey" FOREIGN KEY ("hotelId", "roomType") REFERENCES "HotelRoomType"("hotelId", "roomType") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightInfo" ADD CONSTRAINT "FlightInfo_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Airport" ADD CONSTRAINT "Airport_city_country_fkey" FOREIGN KEY ("city", "country") REFERENCES "Location"("city", "country") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_messageQueueId_fkey" FOREIGN KEY ("messageQueueId") REFERENCES "MessageQueue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HotelToUser" ADD CONSTRAINT "_HotelToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HotelToUser" ADD CONSTRAINT "_HotelToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
