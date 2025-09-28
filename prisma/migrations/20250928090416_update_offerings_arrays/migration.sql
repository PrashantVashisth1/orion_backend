/*
  Warnings:

  - The `products` column on the `offerings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `services` column on the `offerings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."offerings" DROP COLUMN "products",
ADD COLUMN     "products" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "services",
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "certifications" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "partnerships" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "revenue_streams" SET DEFAULT ARRAY[]::TEXT[];
