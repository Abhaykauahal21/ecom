import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { withRetry } from "@/lib/safe-db";
import EditProductForm from "@/components/admin/EditProductForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
  );

  if (!product) {
    notFound();
  }

  // Serialize product for the client component
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="container mx-auto px-4 py-8">
      <EditProductForm product={serializedProduct} />
    </div>
  );
}
