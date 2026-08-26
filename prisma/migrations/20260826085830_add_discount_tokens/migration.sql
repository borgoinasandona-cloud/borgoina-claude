-- CreateTable
CREATE TABLE "DiscountToken" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "discountPct" INTEGER NOT NULL,
    "totalIssued" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenRedemption" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRedemption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscountToken" ADD CONSTRAINT "DiscountToken_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenRedemption" ADD CONSTRAINT "TokenRedemption_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "DiscountToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenRedemption" ADD CONSTRAINT "TokenRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
