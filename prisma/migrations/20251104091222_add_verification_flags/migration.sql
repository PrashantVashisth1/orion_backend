-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "has_submitted_profile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_startup_verified" BOOLEAN NOT NULL DEFAULT false;
