import prisma from "@/lib/prisma";
import CategoryDashboard from "./CategoryDashboard";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const dbCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Serialize dates to match the Category interface expectation in client component
  const categories = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    createdAt: cat.createdAt.toISOString(),
    productCount: cat._count.products,
  }));

  return <CategoryDashboard initialCategories={categories} />;
}
