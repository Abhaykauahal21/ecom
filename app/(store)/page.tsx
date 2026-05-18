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

  return (
    <HomeContent 
      products={JSON.parse(JSON.stringify(products))} 
      categories={JSON.parse(JSON.stringify(categories))} 
      banners={JSON.parse(JSON.stringify(banners))}
    />
  );
}
