"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBanner, deleteBanner } from "@/app/actions/banner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BannerList({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setBanners(banners.map(b => b.id === id ? { ...b, isActive: newStatus } : b));
    
    const res = await toggleBanner(id, newStatus);
    if (!res.success) {
        // Revert
        setBanners(banners.map(b => b.id === id ? { ...b, isActive: currentStatus } : b));
        toast.error("Failed to update banner status");
    } else {
        toast.success(`Banner ${newStatus ? 'activated' : 'deactivated'}`);
        router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    setIsDeleting(id);
    const res = await deleteBanner(id);
    if (res.success) {
      setBanners(banners.filter(b => b.id !== id));
      toast.success("Banner deleted successfully");
      router.refresh();
    } else {
      toast.error("Failed to delete banner");
    }
    setIsDeleting(null);
  };

  if (banners.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="text-muted-foreground mb-4">No banners found</div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {banners.map((banner) => (
        <div key={banner.id} className="p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-full md:w-64 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <Image 
              src={banner.imageUrl} 
              alt={banner.label}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="font-bold text-lg">{banner.label}</h3>
            {banner.link && (
                <a href={banner.link} target="_blank" rel="noreferrer" className="text-sm text-brand flex items-center justify-center md:justify-start gap-1 hover:underline">
                    {banner.link} <ExternalLink className="h-3 w-3" />
                </a>
            )}
            <div className="text-xs text-muted-foreground">
                Added on {new Date(banner.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{banner.isActive ? "Active" : "Inactive"}</span>
                <input 
                    type="checkbox"
                    checked={banner.isActive}
                    onChange={() => handleToggle(banner.id, banner.isActive)}
                    className="w-5 h-5 accent-brand"
                />
            </div>
            
            <Button 
                variant="destructive" 
                size="icon"
                onClick={() => handleDelete(banner.id)}
                disabled={isDeleting === banner.id}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
