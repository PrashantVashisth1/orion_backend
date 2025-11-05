/*
  Warnings:

  - Made the column `company` on table `business_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `linkedin_profile` on table `business_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_website` on table `company_details` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."business_details" ALTER COLUMN "company" SET NOT NULL,
ALTER COLUMN "linkedin_profile" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."company_details" ALTER COLUMN "company_website" SET NOT NULL,
ALTER COLUMN "vision" DROP NOT NULL,
ALTER COLUMN "mission" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."personal_info" ALTER COLUMN "last_name" DROP NOT NULL;
