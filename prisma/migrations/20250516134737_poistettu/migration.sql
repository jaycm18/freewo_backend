/*
  Warnings:

  - Made the column `category` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "budget" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- DropEnum
DROP TYPE "Role";
