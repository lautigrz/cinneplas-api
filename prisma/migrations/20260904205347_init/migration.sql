/*
  Warnings:

  - A unique constraint covering the columns `[idPublic]` on the table `cinema_rooms` will be added. If there are existing duplicate values, this will fail.
  - The required column `idPublic` was added to the `cinema_rooms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "oauth_accounts" DROP CONSTRAINT "oauth_accounts_userId_fkey";

-- AlterTable
ALTER TABLE "cinema_rooms" ADD COLUMN     "idPublic" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cinema_rooms_idPublic_key" ON "cinema_rooms"("idPublic");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
