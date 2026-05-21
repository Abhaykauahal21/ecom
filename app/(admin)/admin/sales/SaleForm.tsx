"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, ArrowLeft, Loader2, Search, CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createSale, updateSale } from "@/app/actions/sale";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: {
    name: string;
  };
}

interface SaleFormProps {
  products: ProductItem[];
  initialData?: {
    id: string;
    name: string;
    announcementText: string;
    couponImageUrl?: string | null;
    discountPercent: number;
    isActive: boolean;
  };
  initialProductIds?: string[];
  isEdit?: boolean;
}

export default function SaleForm({ products, initialData, initialProductIds = [], isEdit = false }: SaleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds);
  const [urlInput, setUrlInput] = useState(initialData?.couponImageUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setUrlInput("");
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProductIds(products.map(p => p.id));
    toast.success("Selected all products");
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
    toast.success("Deselected all products");
  };

  const handleSelectByCategory = (categoryName: string) => {
    const categoryProductIds = products
      .filter(p => p.category.name.toLowerCase() === categoryName.toLowerCase())
      .map(p => p.id);

    setSelectedProductIds(prev => {
      const filteredPrev = prev.filter(id => !categoryProductIds.includes(id));
      return [...filteredPrev, ...categoryProductIds];
    });
    toast.success(`Selected all products in ${categoryName}`);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (isEdit && initialData) {
        result = await updateSale(initialData.id, formData, selectedProductIds);
      } else {
        result = await createSale(formData, selectedProductIds);
      }

      if (result.success) {
        toast.success(isEdit ? "Promo event updated successfully!" : "Promo event created successfully!");
        router.push("/admin/sales");
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      toast.error(err.message || "A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Get unique categories for quick selection
  const categories = Array.from(new Set(products.map(p => p.category.name))).sort();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/sales">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            {isEdit ? "Edit Sale" : "New Sale Announcement"}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isEdit ? "Modify promotion event configurations." : "Launch a new sale, type announcement ticker, and pick target products."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* General Fields */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="uppercase tracking-widest text-xs font-black">Promotion Configurations</CardTitle>
                <CardDescription>Setup parameters of the discount promotion.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Sale Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Summer Special" 
                    defaultValue={initialData?.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercent" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Discount Percentage *</Label>
                  <Input 
                    id="discountPercent" 
                    name="discountPercent" 
                    type="number" 
                    min="0"
                    max="100"
                    required 
                    placeholder="e.g. 20" 
                    defaultValue={initialData?.discountPercent || 0}
                  />
                  <p className="text-[10px] text-muted-foreground">Discounts apply dynamically to the retail price of selective products.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcementText" className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Announcement Strip Text *</Label>
                  <Input 
                    id="announcementText" 
                    name="announcementText" 
                    required 
                    placeholder="e.g. ⚡ SUMMER SALE: 20% DISCOUNT ON BEST SELLERS! ⚡" 
                    defaultValue={initialData?.announcementText}
                  />
                  <p className="text-[10px] text-muted-foreground">This text will be shown in the warning/promo banner just above the home page hero slider.</p>
                </div>

                <div className="space-y-3">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Coupon Box Background Image</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input 
                        id="couponImageUrl" 
                        name="couponImageUrl" 
                        placeholder="Paste image URL (optional)" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 text-xs"
                      />
                      {urlInput && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setUrlInput("")} 
                          className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="relative group border border-dashed border-muted-foreground/30 rounded-xl p-4 flex flex-col items-center justify-center hover:border-brand transition-colors cursor-pointer bg-muted/10">
                      <input 
                        type="file" 
                        id="couponImageFile" 
                        name="couponImageFile" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center text-center space-y-1 pointer-events-none">
                        <Upload className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                          {selectedFile ? selectedFile.name : "Or Upload Image File"}
                        </span>
                        <span className="text-[8px] text-muted-foreground uppercase">PNG, JPG, WEBP up to 5MB</span>
                      </div>
                    </div>
                  </div>

                  {(urlInput || previewUrl) && (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-muted bg-black shadow-inner flex items-center justify-center group mt-2">
                      <Image 
                        src={previewUrl || urlInput} 
                        alt="Coupon background preview" 
                        fill 
                        className="object-cover" 
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          type="button"
                          onClick={clearPreview}
                          className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground leading-normal">Customize the storefront coupon ticket backdrop. If empty, the default dark-and-gold styling will be applied.</p>
                </div>

                <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-xl border border-dashed">
                  <Checkbox 
                    id="isActive" 
                    name="isActive" 
                    defaultChecked={initialData?.isActive} 
                    className="h-5 w-5" 
                  />
                  <Label htmlFor="isActive" className="font-bold uppercase text-[10px] tracking-tighter cursor-pointer">Activate Announcement</Label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest text-md shadow-lg shadow-brand/20 transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      <span>Save Promo Event</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Selective Products List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="uppercase tracking-widest text-xs font-black">Target Products ({selectedProductIds.length} Selected)</CardTitle>
                    <CardDescription>Check products that qualify for this promo discount.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} className="text-[10px] uppercase font-black tracking-wider rounded-lg">Select All</Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll} className="text-[10px] uppercase font-black tracking-wider rounded-lg">Clear All</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Search & Quick Selection Filters */}
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
                    <Input 
                      placeholder="Search products by name, brand, or category..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] font-black uppercase text-muted-foreground mr-1.5">Select Category:</span>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectByCategory(cat)}
                          className="bg-muted hover:bg-brand/10 hover:text-brand border text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products Checklist */}
                <div className="border rounded-2xl overflow-hidden divide-y max-h-[450px] overflow-y-auto bg-background">
                  {filteredProducts.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground uppercase text-xs font-black tracking-widest">
                      No products match your search.
                    </div>
                  ) : (
                    filteredProducts.map(product => {
                      const isSelected = selectedProductIds.includes(product.id);
                      return (
                        <div 
                          key={product.id}
                          onClick={() => handleProductToggle(product.id)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => handleProductToggle(product.id)}
                              className="h-5 w-5"
                              onClick={(e) => e.stopPropagation()} // Stop bubbling so click is only processed once
                            />
                            <div className="space-y-0.5">
                              <span className="block font-bold text-sm leading-tight text-foreground">{product.name}</span>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span>{product.category.name}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-black text-sm text-foreground shrink-0">₹{Number(product.price).toLocaleString()}</span>
                        </div>
                      );
                    })
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
