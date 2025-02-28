-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'inactive';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'inactive';
