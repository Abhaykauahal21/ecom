export interface ProductWithSale {
  price: number | string;
  comparePrice?: number | string | null;
  sale?: {
    isActive: boolean;
    discountPercent: number;
    announcementText: string;
  } | null;
}

export function getProductPrices(product: ProductWithSale) {
  const originalPrice = Number(product.price);
  const existingComparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  
  if (product.sale && product.sale.isActive) {
    const discount = product.sale.discountPercent;
    const salePrice = Math.round(originalPrice * (1 - discount / 100));
    return {
      price: salePrice,
      comparePrice: originalPrice, // Show original price as crossed out
      isOnSale: true,
      discountPercent: discount,
      announcementText: product.sale.announcementText
    };
  }
  
  return {
    price: originalPrice,
    comparePrice: existingComparePrice,
    isOnSale: false,
    discountPercent: 0,
    announcementText: null
  };
}
