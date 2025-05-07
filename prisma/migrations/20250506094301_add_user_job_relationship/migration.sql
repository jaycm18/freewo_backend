-- AlterTable
ALTER TABLE "User" ADD COLUMN     "category" TEXT,
ADD COLUMN     "name" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
