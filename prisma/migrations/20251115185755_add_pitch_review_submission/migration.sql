-- CreateTable
CREATE TABLE "public"."PitchReviewSubmission" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT NOT NULL,
    "jsonUrl" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PitchReviewSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PitchReviewSubmission_userId_key" ON "public"."PitchReviewSubmission"("userId");

-- AddForeignKey
ALTER TABLE "public"."PitchReviewSubmission" ADD CONSTRAINT "PitchReviewSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
