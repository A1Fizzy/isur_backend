-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('URGENT', 'NORMAL');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "priority" "PriorityLevel" NOT NULL DEFAULT 'NORMAL';
