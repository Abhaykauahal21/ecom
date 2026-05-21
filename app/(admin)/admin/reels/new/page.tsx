"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInstagramReel } from "@/app/actions/reel";
import { toast } from "sonner";

export default function NewReelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instagramUrl: "",
    caption: "",
    likes: "1.2k",
    comments: "120",
    directVideoUrl: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const instagramUrl = data.get("instagramUrl") as string;
    const directVideoUrl = data.get("directVideoUrl") as string;
    const videoFile = data.get("videoFile") as File | null;

    if (!instagramUrl.trim()) {
      toast.error("Instagram URL is required");
      return;
    }
    if (!directVideoUrl.trim() && (!videoFile || videoFile.size === 0)) {
      toast.error("Please provide either a Direct Video URL or upload an MP4 video file.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await createInstagramReel(data);
      if (res.success) {
        toast.success("Instagram reel added successfully!");
        router.push("/admin/reels");
      } else {
        toast.error(res.message || "Failed to add reel");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while adding the reel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/reels" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Reels
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 text-brand rounded-lg">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Add New Instagram Reel</h1>
            <p className="text-muted-foreground mt-1">Add a looping video reel linked to your Instagram post.</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram Reel Link *</Label>
            <Input 
              id="instagramUrl"
              name="instagramUrl"
              placeholder="e.g. https://www.instagram.com/reel/C7XYZ/"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})}
              required
            />
            <p className="text-xs text-muted-foreground">This is the link users will be redirected to when they click the reel on the storefront.</p>
          </div>

          <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-white/5">
            <Label className="font-bold text-sm">Video Source *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="directVideoUrl" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Option 1: Upload Video (MP4) File</Label>
                <Input 
                  id="videoFile"
                  name="videoFile"
                  type="file"
                  accept="video/mp4, video/quicktime"
                  className="file:bg-black file:text-white file:border-0 file:rounded-md file:text-[10px] file:font-black file:uppercase file:px-3 file:py-1 cursor-pointer h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="directVideoUrl" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Option 2: Or Provide Direct Video URL</Label>
                <Input 
                  id="directVideoUrl"
                  name="directVideoUrl"
                  placeholder="e.g. https://assets.mixkit.co/videos/...mp4"
                  value={formData.directVideoUrl}
                  onChange={(e) => setFormData({...formData, directVideoUrl: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Uploading an MP4 file will save it to Cloudinary. Keep videos short (3-8 seconds) and under 10MB for fast loading.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input 
              id="caption"
              name="caption"
              placeholder="e.g. Crushing arms today! 💪"
              value={formData.caption}
              onChange={(e) => setFormData({...formData, caption: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Shown as overlay text on the storefront hover card.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likes">Likes Count (Display only)</Label>
              <Input 
                id="likes"
                name="likes"
                placeholder="e.g. 1.2k"
                value={formData.likes}
                onChange={(e) => setFormData({...formData, likes: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments Count (Display only)</Label>
              <Input 
                id="comments"
                name="comments"
                placeholder="e.g. 120"
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">Active Status</Label>
              <p className="text-xs text-muted-foreground">If disabled, this reel will not show on the home page.</p>
            </div>
            <input 
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="w-5 h-5 accent-brand cursor-pointer"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/reels")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand text-black hover:bg-brand/90 font-bold min-w-[120px]" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Reel...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Reel</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
