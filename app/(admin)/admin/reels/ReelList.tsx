"use client";

import { useState } from "react";
import { Trash2, Edit, ExternalLink, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteInstagramReel, updateInstagramReel } from "@/app/actions/reel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReelList({ initialReels }: { initialReels: any[] }) {
  const [reels, setReels] = useState(initialReels);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = async (id: string, currentStatus: boolean, reelData: any) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setReels(reels.map(r => r.id === id ? { ...r, isActive: newStatus } : r));
    
    const formData = new FormData();
    formData.append("instagramUrl", reelData.instagramUrl);
    formData.append("caption", reelData.caption || "");
    formData.append("likes", reelData.likes);
    formData.append("comments", reelData.comments);
    if (newStatus) {
      formData.append("isActive", "on");
    }

    const res = await updateInstagramReel(id, formData);
    if (!res.success) {
      // Revert
      setReels(reels.map(r => r.id === id ? { ...r, isActive: currentStatus } : r));
      toast.error("Failed to update reel status");
    } else {
      toast.success(`Reel ${newStatus ? 'activated' : 'deactivated'}`);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Instagram reel?")) return;
    
    setIsDeleting(id);
    const res = await deleteInstagramReel(id);
    if (res.success) {
      setReels(reels.filter(r => r.id !== id));
      toast.success("Instagram reel deleted successfully");
      router.refresh();
    } else {
      toast.error("Failed to delete reel");
    }
    setIsDeleting(null);
  };

  if (reels.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="text-muted-foreground mb-4">No Instagram reels found. Add one to show on your storefront home page!</div>
        <Link href="/admin/reels/new">
          <Button className="bg-brand text-black hover:bg-brand/90 font-bold">Add Your First Reel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {reels.map((reel) => (
        <div key={reel.id} className="p-6 flex flex-col md:flex-row gap-6 items-center">
          {/* Reel Looping Video Preview */}
          <div className="relative w-32 aspect-[9/16] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-border">
            <video 
              src={reel.videoUrl} 
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
            <h3 className="font-bold text-lg truncate max-w-md">
              {reel.caption || <span className="text-muted-foreground italic font-normal text-sm">No Caption</span>}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1 text-red-500">
                <Heart className="h-3.5 w-3.5 fill-current" /> {reel.likes}
              </span>
              <span className="flex items-center gap-1 text-blue-500">
                <MessageCircle className="h-3.5 w-3.5 fill-current" /> {reel.comments}
              </span>
              <span>Added: {new Date(reel.createdAt).toLocaleDateString()}</span>
            </div>

            <a 
              href={reel.instagramUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm text-brand flex items-center justify-center md:justify-start gap-1 hover:underline truncate max-w-xl font-medium"
            >
              {reel.instagramUrl} <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{reel.isActive ? "Active" : "Inactive"}</span>
              <input 
                type="checkbox"
                checked={reel.isActive}
                onChange={() => handleToggle(reel.id, reel.isActive, reel)}
                className="w-5 h-5 accent-brand cursor-pointer"
              />
            </div>
            
            <div className="flex gap-2">
              <Link href={`/admin/reels/${reel.id}/edit`}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => handleDelete(reel.id)}
                disabled={isDeleting === reel.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
