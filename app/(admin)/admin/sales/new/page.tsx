import prisma from "@/lib/prisma";
import SaleForm from "../SaleForm";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
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

  const serializedProducts = JSON.parse(JSON.stringify(products)).map((p: any) => ({
    ...p,
    price: Number(p.price),
  }));

  return <SaleForm products={serializedProducts} />;
}
