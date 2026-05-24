/*
  Warnings:

  - Added the required column `arrival` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departure` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operator` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Bus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "arrival" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "departure" TEXT NOT NULL,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "operator" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
