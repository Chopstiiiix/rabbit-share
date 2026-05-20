-- CreateTable
CREATE TABLE "Celebration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'birthday',
    "customCategory" TEXT,
    "celebrant" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Celebration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "celebrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT,
    "videoUrl" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalVideo" (
    "id" TEXT NOT NULL,
    "celebrationId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Celebration_slug_key" ON "Celebration"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FinalVideo_celebrationId_key" ON "FinalVideo"("celebrationId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalVideo" ADD CONSTRAINT "FinalVideo_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
