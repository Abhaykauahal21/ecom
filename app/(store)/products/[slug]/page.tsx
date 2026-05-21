export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { withRetry } from "@/lib/safe-db";
import ProductDetailView from "@/components/store/ProductDetailView";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { slug },
    })
  );

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | SuppStore`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        sale: true,
      },
    })
  );

  if (!product) {
    notFound();
  }

  const relatedProducts = await withRetry(() =>
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        sale: true,
      },
      take: 4,
    })
  );

  // Serialize Decimal to number for the client component
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailView 
      product={serializedProduct} 
      relatedProducts={serializedRelatedProducts} 
    />
  );
}
