-- DropIndex
DROP INDEX "Order_ticketNumber_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
