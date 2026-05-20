export const dynamic = "force-dynamic";

import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import ProductTable from "./ProductTable";
import { withRetry } from "@/lib/safe-db";

export default async function AdminProductsPage() {
  const products = await withRetry(() => prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your supplement inventory and details.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-brand text-black hover:bg-brand/90 font-bold uppercase tracking-widest">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="font-bold uppercase text-xs">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" className="font-bold uppercase text-xs">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTable initialProducts={JSON.parse(JSON.stringify(products))} />
        </CardContent>
      </Card>
    </div>
  );
}
