"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBanner } from "@/app/actions/banner";
import { toast } from "sonner";

export default function NewBannerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    imageUrl: "",
    link: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const label = data.get("label") as string;
    const imageUrl = data.get("imageUrl") as string;
    const file = data.get("imageFile") as File | null;

    if (!label.trim()) {
        toast.error("Banner label is required");
        return;
    }
    if (!imageUrl.trim() && (!file || file.size === 0)) {
        toast.error("Please provide either an Image URL or upload an image file");
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const res = await createBanner(data);
        if (res.success) {
            toast.success("Banner created successfully");
            router.push("/admin/banners");
        } else {
            toast.error(res.error || "Failed to create banner");
        }
    } catch (error) {
        toast.error("An error occurred");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/banners" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Banners
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Add New Banner</h1>
        <p className="text-muted-foreground mt-1">Create a new full-width banner for the home screen.</p>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="space-y-2">
            <Label htmlFor="label">Banner Label *</Label>
            <Input 
                id="label"
                name="label"
                placeholder="e.g. Summer Sale 2026"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                required
            />
            <p className="text-xs text-muted-foreground">This is for internal reference only.</p>
          </div>

          <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-white/5">
            <Label className="font-bold text-sm">Banner Image Asset</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">Option 1: Provide Image URL</Label>
                <Input 
                    id="imageUrl"
                    name="imageUrl"
                    placeholder="https://example.com/banner-image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageFile" className="text-xs text-muted-foreground">Option 2: Or Upload File (JPEG/PNG/WEBP)</Label>
                <Input 
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="file:bg-black file:text-white file:border-0 file:rounded-md file:text-[10px] file:font-black file:uppercase file:px-3 file:py-1 cursor-pointer h-10"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recommended aspect ratio is 16:9 or wider (e.g. 1920x1080 or 1200x630).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Target Link (Optional)</Label>
            <Input 
                id="link"
                name="link"
                placeholder="https://yourstore.com/products/sale"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Where should the user go when they click the banner?</p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
            <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base">Active Status</Label>
                <p className="text-xs text-muted-foreground">If disabled, the banner will not show on the storefront.</p>
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
            <Button type="button" variant="outline" onClick={() => router.push("/admin/banners")} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" className="bg-brand text-black hover:bg-brand/90 font-bold min-w-[120px]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Banner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
