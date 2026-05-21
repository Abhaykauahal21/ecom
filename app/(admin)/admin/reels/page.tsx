import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import ReelList from "./ReelList";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const reels = await prisma.instagramReel.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Manage Instagram Reels</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or delete dynamic looping reels shown on the store home page.</p>
        </div>
        <Link href="/admin/reels/new">
          <Button className="bg-brand text-black hover:bg-brand/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Add New Reel
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading reels...</div>}>
          <ReelList initialReels={JSON.parse(JSON.stringify(reels))} />
        </Suspense>
      </div>
    </div>
  );
}
