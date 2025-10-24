-- CreateTable
CREATE TABLE "public"."ResourceFile" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResourceCategory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ResourceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_title_key" ON "public"."ResourceCategory"("title");

-- AddForeignKey
ALTER TABLE "public"."ResourceFile" ADD CONSTRAINT "ResourceFile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ResourceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
