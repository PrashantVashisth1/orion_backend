/*
  Warnings:

  - You are about to drop the column `grade_copa` on the `student_education_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."student_education_records" DROP COLUMN "grade_copa",
ADD COLUMN     "grade_cgpa" TEXT;
