import { Suspense } from "react";
import Link from "next/link";
import { Plus, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import SalesList from "./SalesList";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    include: {
      products: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Safe serialization
  const serializedSales = JSON.parse(JSON.stringify(sales));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <Percent className="h-8 w-8 text-brand" />
            Manage Sales
          </h1>
          <p className="text-muted-foreground font-medium">Create promotional events, set discounts, and link them to selective products.</p>
        </div>
        <Link href="/admin/sales/new">
          <Button className="bg-brand text-black hover:bg-brand/90 font-black text-xs uppercase tracking-widest px-6 h-12 shadow-[0_0_20px_rgba(0,255,135,0.15)]">
            <Plus className="mr-2 h-4 w-4" />
            Create Sale
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground uppercase font-black text-xs tracking-widest">Loading Sales...</div>}>
          <SalesList initialSales={serializedSales} />
        </Suspense>
      </div>
    </div>
  );
}
