export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import HomeContent from "./HomeContent";
import { withRetry } from "@/lib/safe-db";

export default async function LandingPage() {
  const products = await withRetry(() => prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true,
      sale: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }));

  const categories = await withRetry(() => prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  }));

  const banners = await withRetry(() => prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  }));

  const activeSale = await withRetry(() => prisma.sale.findFirst({
    where: { isActive: true },
  }));

  const instagramReels = await withRetry(() => prisma.instagramReel.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  }));

  return (
    <HomeContent 
      products={JSON.parse(JSON.stringify(products))} 
      categories={JSON.parse(JSON.stringify(categories))} 
      banners={JSON.parse(JSON.stringify(banners))}
      activeSale={activeSale ? JSON.parse(JSON.stringify(activeSale)) : null}
      instagramReels={JSON.parse(JSON.stringify(instagramReels))}
    />
  );
}
