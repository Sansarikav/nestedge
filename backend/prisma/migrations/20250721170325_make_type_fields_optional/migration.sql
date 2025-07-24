/*
  Warnings:

  - The primary key for the `Property` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Property" DROP CONSTRAINT "Property_pkey",
ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "furnishing" TEXT,
ADD COLUMN     "listingType" TEXT,
ADD COLUMN     "type" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "Property_pkey" PRIMARY KEY ("id");
