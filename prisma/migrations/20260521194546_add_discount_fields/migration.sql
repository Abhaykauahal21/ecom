-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isBestPick" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleId" TEXT;

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "shippingCharge" DECIMAL(10,2) NOT NULL DEFAULT 99.00,
    "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "announcementText" TEXT NOT NULL,
    "couponImageUrl" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramReel" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "caption" TEXT,
    "likes" TEXT NOT NULL DEFAULT '1.2k',
    "comments" TEXT NOT NULL DEFAULT '120',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramReel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
