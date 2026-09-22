-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "idPublic" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "s3KeyPoster" VARCHAR(50),
    "s3KeyBackdrop" VARCHAR(50),
    "duration" INTEGER NOT NULL,
    "releaseDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_idPublic_key" ON "movies"("idPublic");
