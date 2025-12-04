/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerNote" TEXT,
ADD COLUMN     "ticketNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_ticketNumber_key" ON "Order"("ticketNumber");
