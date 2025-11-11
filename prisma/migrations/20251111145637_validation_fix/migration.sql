-- AlterTable
ALTER TABLE "public"."company_details" ALTER COLUMN "company_location" DROP NOT NULL,
ALTER COLUMN "company_website" DROP NOT NULL,
ALTER COLUMN "company_description" DROP NOT NULL,
ALTER COLUMN "industry" DROP NOT NULL;
