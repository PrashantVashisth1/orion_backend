/*
  Warnings:

  - Added the required column `updatedAt` to the `PitchReviewSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PitchReviewSubmission" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "pdfUrl" DROP NOT NULL,
ALTER COLUMN "jsonUrl" DROP NOT NULL;
