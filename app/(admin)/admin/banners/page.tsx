import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import BannerList from "./BannerList";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Manage Banners</h1>
          <p className="text-muted-foreground mt-1">Add and manage full-width home screen banners.</p>
        </div>
        <Link href="/admin/banners/new">
          <Button className="bg-brand text-black hover:bg-brand/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading banners...</div>}>
          <BannerList initialBanners={banners} />
        </Suspense>
      </div>
    </div>
  );
}
