import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import SaleForm from "../../SaleForm";

export const dynamic = "force-dynamic";

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!sale) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      brand: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const serializedSale = {
    id: sale.id,
    name: sale.name,
    announcementText: sale.announcementText,
    discountPercent: sale.discountPercent,
    isActive: sale.isActive,
    couponImageUrl: sale.couponImageUrl,
  };

  const serializedProducts = JSON.parse(JSON.stringify(products)).map((p: any) => ({
    ...p,
    price: Number(p.price),
  }));

  const initialProductIds = sale.products.map((p) => p.id);

  return (
    <SaleForm
      products={serializedProducts}
      initialData={serializedSale}
      initialProductIds={initialProductIds}
      isEdit={true}
    />
  );
}
