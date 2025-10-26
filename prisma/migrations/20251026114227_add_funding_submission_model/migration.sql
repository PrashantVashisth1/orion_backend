-- CreateTable
CREATE TABLE "public"."funding_submissions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funding_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "funding_submissions_userId_idx" ON "public"."funding_submissions"("userId");

-- AddForeignKey
ALTER TABLE "public"."funding_submissions" ADD CONSTRAINT "funding_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
