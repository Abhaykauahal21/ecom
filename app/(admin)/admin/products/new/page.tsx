"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createProduct, type ProductFormState } from "@/app/actions/product";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ProductFormState | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setState(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createProduct(formData);
      setState(result);

      if (result.success) {
        // Show success for 1.5s then redirect
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      }
    } catch (err) {
      setState({
        success: false,
        message: "A network error occurred. Please check your connection."
      });
    } finally {
      setLoading(false);
    }
  }

  // Helper to show field error
  const getFieldError = (field: string) => {
    return state?.errors?.[field]?.[0];
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">New Product</h1>
          <p className="text-muted-foreground font-medium">Add a new premium supplement to your store inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">General Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {state && !state.success && (
                  <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{state.message}</span>
                  </div>
                )}

                {state && state.success && (
                  <div className="p-4 bg-green-50 text-green-700 text-sm font-bold rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2 border border-green-200">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{state.message} Redirecting...</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Product Name *</Label>
                  <Input id="name" name="name" required placeholder="e.g. Kavya Boss Whey Protein" className={getFieldError("name") ? "border-destructive" : ""} />
                  {getFieldError("name") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("name")}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">URL Slug (Auto-generated if empty)</Label>
                  <Input id="slug" name="slug" placeholder="e.g. kavya-boss-whey-protein" />
                  <p className="text-[10px] text-muted-foreground font-medium">Unique identifier for the product URL.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Description *</Label>
                  <Textarea id="description" name="description" required placeholder="Detailed product description..." className={`min-h-[150px] ${getFieldError("description") ? "border-destructive" : ""}`} />
                  {getFieldError("description") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("description")}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">Media Assets (Up to 4 Images)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3 bg-muted/10 p-4 rounded-xl border border-white/5">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Image {i} {i === 1 ? "(Primary)" : "(Optional)"}</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Provide Image URL</span>
                          <Input id={`image-url-${i}`} name="images" placeholder="https://..." className={getFieldError(`images[${i - 1}]`) ? "border-destructive" : ""} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Or Upload File (JPEG/PNG)</span>
                          <Input id={`image-file-${i}`} name="imageFiles" type="file" accept="image/jpeg, image/png, image/webp" className="file:bg-black file:text-white file:border-0 file:rounded-md file:text-[10px] file:font-black file:uppercase file:px-3 file:py-1 cursor-pointer h-10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">You can provide a URL link, upload a file from your computer, or both. Uploaded files will be securely saved to Cloudinary.</p>
                {getFieldError("images") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("images")}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Sale Price (₹) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" className={getFieldError("price") ? "border-destructive" : ""} />
                  {getFieldError("price") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("price")}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Original Price (₹)</Label>
                  <Input id="comparePrice" name="comparePrice" type="number" step="0.01" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Inventory Count *</Label>
                  <Input id="stock" name="stock" type="number" required placeholder="0" defaultValue={0} className={getFieldError("stock") ? "border-destructive" : ""} />
                  {getFieldError("stock") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("stock")}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">Organization</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Manufacturer / Brand *</Label>
                  <Input id="brand" name="brand" required placeholder="e.g. Kavya Boss" className={getFieldError("brand") ? "border-destructive" : ""} />
                  {getFieldError("brand") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("brand")}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Product Category *</Label>
                  <Input id="category" name="category" required placeholder="e.g. Whey Protein" className={getFieldError("categoryName") ? "border-destructive" : ""} />
                  {getFieldError("categoryName") && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{getFieldError("categoryName")}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">Status & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <Checkbox id="isActive" name="isActive" defaultChecked className="h-5 w-5" />
                  <Label htmlFor="isActive" className="font-bold uppercase text-[10px] tracking-tighter">Available for Sale</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="isFeatured" name="isFeatured" className="h-5 w-5" />
                  <Label htmlFor="isFeatured" className="font-bold uppercase text-[10px] tracking-tighter">Promote on Home Page</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="isBestPick" name="isBestPick" className="h-5 w-5" />
                  <Label htmlFor="isBestPick" className="font-bold uppercase text-[10px] tracking-tighter">Add to Best Picks</Label>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest text-lg shadow-lg shadow-brand/20 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  <span>Publish Product</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
