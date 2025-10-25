-- AlterTable
ALTER TABLE "public"."startup_profiles" ADD COLUMN     "isStartupOfTheWeek" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false;
