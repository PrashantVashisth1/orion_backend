-- CreateEnum
CREATE TYPE "public"."SessionType" AS ENUM ('WEBINAR', 'PANEL_DISCUSSION', 'PRODUCT_DEMO');

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" SERIAL NOT NULL,
    "type" "public"."SessionType" NOT NULL,
    "title" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "duration" TEXT NOT NULL,
    "registrationLink" TEXT,
    "audienceStudents" BOOLEAN,
    "audienceProfessionals" BOOLEAN,
    "description" TEXT,
    "speakerName" TEXT,
    "speakerEmail" TEXT,
    "contactInfo" TEXT,
    "panelistName" TEXT,
    "panelistDesignation" TEXT,
    "panelistBio" TEXT,
    "moderatorName" TEXT,
    "moderatorDesignation" TEXT,
    "moderatorBio" TEXT,
    "presenterName" TEXT,
    "presenterDesignation" TEXT,
    "presenterAffiliation" TEXT,
    "aboutCompany" TEXT,
    "aboutProduct" TEXT,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
