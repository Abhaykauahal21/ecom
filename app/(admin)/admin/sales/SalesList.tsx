"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Edit, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaleActive, deleteSale } from "@/app/actions/sale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function SalesList({ initialSales }: { initialSales: any[] }) {
  const [sales, setSales] = useState(initialSales);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic update: toggle this one and deactivate others if activating
    setSales(sales.map(s => {
      if (s.id === id) {
        return { ...s, isActive: newStatus };
      }
      return newStatus ? { ...s, isActive: false } : s;
    }));

    const res = await toggleSaleActive(id, newStatus);
    if (!res.success) {
      // Revert
      setSales(initialSales);
      toast.error(res.error || "Failed to update sale status");
    } else {
      toast.success(`Sale ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale? Selected products will be removed from this sale, but they will NOT be deleted.")) {
      return;
    }

    setIsDeleting(id);
    const res = await deleteSale(id);
    if (res.success) {
      setSales(sales.filter(s => s.id !== id));
      toast.success("Sale promotion deleted successfully");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete sale");
    }
    setIsDeleting(null);
  };

  if (sales.length === 0) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-brand">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-black uppercase tracking-wider text-sm mb-1 text-foreground">No Sales Active</h3>
          <p className="text-xs text-muted-foreground">Create your first discount event to announce on the store!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {sales.map((sale) => (
        <div key={sale.id} className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between hover:bg-muted/10 transition-colors">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-black text-xl uppercase tracking-tight">{sale.name}</h3>
              <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-current" />
                {sale.discountPercent}% OFF
              </Badge>
              {sale.isActive && (
                <Badge className="bg-brand text-black font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Active announcement
                </Badge>
              )}
            </div>

            {/* Live strip preview */}
            <div className="bg-destructive text-destructive-foreground font-black text-xs uppercase px-4 py-2 rounded-xl border border-destructive/20 max-w-2xl flex items-center gap-2">
              <span className="bg-white/20 text-white rounded px-1.5 py-0.5 text-[9px]">Strip preview</span>
              <span className="truncate">{sale.announcementText}</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>{sale.products?.length || 0} Products Selected</span>
              <span>•</span>
              <span>Created on {new Date(sale.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-xl border">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Active:</span>
              <input
                type="checkbox"
                checked={sale.isActive}
                onChange={() => handleToggle(sale.id, sale.isActive)}
                className="w-5 h-5 accent-brand cursor-pointer"
              />
            </div>

            <Link href={`/admin/sales/${sale.id}/edit`}>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:bg-brand hover:text-black">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => handleDelete(sale.id)}
              disabled={isDeleting === sale.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
