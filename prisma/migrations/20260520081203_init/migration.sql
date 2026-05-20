-- CreateTable
CREATE TABLE "Celebration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "celebrant" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadline" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "celebrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT,
    "videoUrl" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinalVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "celebrationId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinalVideo_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Celebration_slug_key" ON "Celebration"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FinalVideo_celebrationId_key" ON "FinalVideo"("celebrationId");
