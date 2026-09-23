-- CreateTable
CREATE TABLE "show_times" (
    "id" SERIAL NOT NULL,
    "idPublic" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "roomId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "show_times_idPublic_key" ON "show_times"("idPublic");

-- AddForeignKey
ALTER TABLE "show_times" ADD CONSTRAINT "show_times_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "cinema_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_times" ADD CONSTRAINT "show_times_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
