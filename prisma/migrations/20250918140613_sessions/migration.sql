/*
  Warnings:

  - You are about to drop the column `audienceProfessionals` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `audienceStudents` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Session" DROP COLUMN "audienceProfessionals",
DROP COLUMN "audienceStudents",
ADD COLUMN     "audience" TEXT[];
