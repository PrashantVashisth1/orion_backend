/*
  Warnings:

  - You are about to drop the column `customer_success_strategy` on the `offerings` table. All the data in the column will be lost.
  - You are about to drop the column `future_offerings` on the `offerings` table. All the data in the column will be lost.
  - You are about to drop the column `onboarding_process` on the `offerings` table. All the data in the column will be lost.
  - You are about to drop the column `price_range` on the `offerings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."offerings" DROP COLUMN "customer_success_strategy",
DROP COLUMN "future_offerings",
DROP COLUMN "onboarding_process",
DROP COLUMN "price_range";
