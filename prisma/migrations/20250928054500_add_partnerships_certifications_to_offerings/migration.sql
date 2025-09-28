/*
  Warnings:

  - You are about to drop the column `support_model` on the `offerings` table. All the data in the column will be lost.
  - You are about to drop the column `target_customers` on the `offerings` table. All the data in the column will be lost.
  - You are about to drop the column `unique_value_proposition` on the `offerings` table. All the data in the column will be lost.
  - The `revenue_streams` column on the `offerings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."offerings" DROP COLUMN "support_model",
DROP COLUMN "target_customers",
DROP COLUMN "unique_value_proposition",
ADD COLUMN     "business_model" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "partnerships" TEXT[],
ADD COLUMN     "target_market" TEXT,
ADD COLUMN     "value_proposition" TEXT,
DROP COLUMN "revenue_streams",
ADD COLUMN     "revenue_streams" TEXT[];
