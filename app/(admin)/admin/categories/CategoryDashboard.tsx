"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Upload, X, FolderOpen, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
  productCount: number;
}

interface CategoryDashboardProps {
  initialCategories: Category[];
}

export default function CategoryDashboard({ initialCategories }: CategoryDashboardProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  // Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setUrlInput("");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setUrlInput(category.image || "");
    setSelectedFile(null);
    setPreviewUrl(category.image || "");
    setIsDialogOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

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

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setTargetCategoryId("");
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    // Validate product reassignment if there are products
    if (categoryToDelete.productCount > 0 && categories.length > 1 && !targetCategoryId) {
      toast.error("Please select a category to move products to.");
      return;
    }

    setIsDeletingConfirm(true);
    try {
      const res = await deleteCategory(categoryToDelete.id, targetCategoryId || undefined);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
        toast.success("Category deleted successfully!");
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete category.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsDeletingConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (selectedFile) {
      formData.append("imageFile", selectedFile);
    } else {
      formData.append("imageUrl", urlInput);
    }

    try {
      let res;
      if (editingCategory) {
        res = await updateCategory(editingCategory.id, formData);
      } else {
        res = await createCategory(formData);
      }

      if (res.success) {
        toast.success(editingCategory ? "Category updated successfully!" : "Category created successfully!");
        setIsDialogOpen(false);
        // Refresh full categories list
        router.refresh();
        window.location.reload(); // Force full reload to update local list
      } else {
        toast.error(res.error || "Failed to save category.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Manage Categories</h1>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mt-1">
            Create categories and upload custom background graphics for storefront cards.
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-12 rounded-2xl shadow-lg shadow-brand/10 self-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border border-zinc-800 bg-zinc-950/80 overflow-hidden rounded-3xl shadow-lg flex flex-col justify-between group">
            <div className="relative aspect-video w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden">
              {category.image ? (
                <img
                  src={category.image.startsWith("//") ? `https:${category.image}` : category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <FolderOpen className="h-10 w-10 text-zinc-700 mb-2 animate-pulse" />
                  <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">No Card Image</span>
                </div>
              )}
            </div>

            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white truncate">{category.name}</h3>
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono">
                  /{category.slug}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => handleOpenEditDialog(category)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-zinc-800 text-white hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Card
                </Button>
                <Button
                  onClick={() => handleDeleteClick(category)}
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 rounded-xl flex items-center justify-center border-none shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="p-20 text-center border border-zinc-800 border-dashed rounded-3xl bg-zinc-950/20 text-zinc-500 font-bold uppercase tracking-widest text-xs">
          No categories found. Click "Add Category" to get started!
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md border border-zinc-800 bg-zinc-950/95 p-8 rounded-3xl text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-glow text-white text-center">
              {editingCategory ? "Edit Category Card" : "New Category Card"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium text-xs uppercase tracking-wider text-center">
              Define category details and configure the image shown on the shop cards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="catName" className="font-black uppercase text-[10px] tracking-widest text-zinc-400">
                Category Name *
              </Label>
              <Input
                id="catName"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Protein, Gainer, Pre Workout"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-brand rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catSlug" className="font-black uppercase text-[10px] tracking-widest text-zinc-400">
                Slug *
              </Label>
              <Input
                id="catSlug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                placeholder="e.g. protein"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-brand rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 block">
                Category Card Image (Upload or URL)
              </Label>

              {previewUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                  <img
                    src={previewUrl.startsWith("//") ? `https:${previewUrl}` : previewUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPreview}
                    className="absolute top-3 right-3 bg-black/75 hover:bg-black/90 p-1.5 rounded-full text-white border border-white/10 hover:scale-105 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-zinc-800 hover:border-brand/40 bg-zinc-900/40 rounded-2xl p-6 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-brand transition-colors">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-zinc-300">Click or drag image file here</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                      Supports PNG, JPG, WEBP (Square / Mockup recommended)
                    </p>
                  </div>
                </div>
              )}

              {!previewUrl && (
                <div className="space-y-1">
                  <div className="text-center font-bold text-[9px] text-zinc-600 uppercase tracking-widest my-2">Or Direct URL</div>
                  <Input
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="bg-zinc-900 border-zinc-800 text-white focus:border-brand rounded-xl text-xs"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-13 rounded-2xl shadow-xl shadow-brand/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Category Card
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md border border-zinc-800 bg-zinc-950/95 p-8 rounded-3xl text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-red-500 text-center">
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium text-xs uppercase tracking-wider text-center mt-1">
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {categoryToDelete && categoryToDelete.productCount > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl text-xs space-y-2">
                  <p className="font-bold text-red-400 uppercase tracking-wider">Warning: Contains Products</p>
                  <p className="text-zinc-300 font-medium leading-relaxed">
                    This category currently contains <span className="font-bold text-white">{categoryToDelete.productCount}</span> product(s).
                    Prisma database constraints require products to belong to a category.
                  </p>
                </div>

                {categories.length > 1 ? (
                  <div className="space-y-2">
                    <Label htmlFor="targetCat" className="font-black uppercase text-[10px] tracking-widest text-zinc-400">
                      Reassign products to: *
                    </Label>
                    <select
                      id="targetCat"
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white focus:border-brand rounded-xl h-11 px-3 text-sm focus:outline-none"
                    >
                      <option value="" disabled>-- Select Category --</option>
                      {categories
                        .filter((c) => c.id !== categoryToDelete.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-400 text-center font-medium leading-relaxed">
                    Since this is the only category, you must create another category first before you can delete this one.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-300 text-center font-medium">
                This category is empty. You can safely delete it. This action cannot be undone.
              </p>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 border-zinc-800 text-white hover:bg-zinc-900 font-bold uppercase text-xs tracking-wider h-12 rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  isDeletingConfirm ||
                  (categoryToDelete !== null && categoryToDelete.productCount > 0 && categories.length <= 1) ||
                  (categoryToDelete !== null && categoryToDelete.productCount > 0 && !targetCategoryId)
                }
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider h-12 rounded-2xl flex items-center justify-center gap-2"
              >
                {isDeletingConfirm ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
