-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "hiddenForReceiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiddenForSender" BOOLEAN NOT NULL DEFAULT false;
