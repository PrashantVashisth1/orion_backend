-- CreateEnum
CREATE TYPE "public"."NeedType" AS ENUM ('LIVE_PROJECTS', 'INTERNSHIP', 'RESEARCH', 'CSR_INITIATIVE');

-- CreateTable
CREATE TABLE "public"."needs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "public"."NeedType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "contact_info" JSONB NOT NULL,
    "details_json" JSONB NOT NULL,
    "location" TEXT,
    "duration" TEXT,
    "skills" TEXT,
    "compensation" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "needs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."needs" ADD CONSTRAINT "needs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
