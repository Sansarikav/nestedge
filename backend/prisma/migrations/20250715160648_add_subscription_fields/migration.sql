-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStart" TIMESTAMP(3);
