-- AlterTable
ALTER TABLE "DiscountToken" DROP COLUMN "discountPct",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TokenRedemption_tokenId_userId_key" ON "TokenRedemption"("tokenId", "userId");
