export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";
import PremiumProductCard from "@/components/store/PremiumProductCard";
import MobileProductCard from "@/components/store/MobileProductCard";
import ProductFilters from "@/components/store/ProductFilters";
import MobileFilterPills from "@/components/store/MobileFilterPills";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SlidersHorizontal, 
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const brandFilter = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;

  const products = await withRetry(() => prisma.product.findMany({
    where: { 
      isActive: true,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
        ]
      } : {}),
      ...(categoryFilter ? { category: { slug: categoryFilter } } : {}),
      ...(brandFilter ? { brand: brandFilter } : {})
    },
    include: { category: true, sale: true },
    orderBy: { createdAt: "desc" },
  }));

  const categories = await withRetry(() => prisma.category.findMany({
    orderBy: { name: "asc" },
  }));

  const brands = Array.from(new Set(products.map(p => p.brand)))
    .sort()
    .map(b => ({ label: b, value: b.toLowerCase().replace(/\s+/g, '-') }));

  const filterCategories = categories.map(c => ({
    label: c.name,
    value: c.slug
  }));

  const serializedProducts = JSON.parse(JSON.stringify(products));

  // For pill filters
  const pillCategories = [
    { label: "All Products", value: "all" },
    ...filterCategories
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Header - Mobile Optimized */}
      <section className="relative pt-12 md:pt-20 pb-8 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-brand/10 blur-[100px] md:blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-brand/5 blur-[80px] md:blur-[100px] rounded-full animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-4">
          <Badge className="bg-brand/10 text-brand border-brand/20 font-black uppercase tracking-[0.3em] text-[10px] px-4 py-1 rounded-full mb-2">
            Elite Supplements
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            The <span className="text-brand">Collection</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs max-w-xs md:max-w-lg mx-auto leading-relaxed">
            Scientifically engineered for those who demand absolute excellence.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        {/* Modern Mobile Search + Filters Row */}
        <div className="md:hidden space-y-6 mb-8">
            <form action="/products" className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
                <Input 
                    name="q"
                    defaultValue={q}
                    placeholder="Search premium products..." 
                    className="pl-14 h-14 bg-muted/30 border-none rounded-[2rem] font-bold text-xs focus-visible:ring-brand/30 shadow-sm"
                />
            </form>
            <MobileFilterPills items={pillCategories} selected={categoryFilter || "all"} />
        </div>

        {/* Toolbar - Sticky Glassmorphism */}
        <div className="sticky top-20 z-30 bg-background/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-3xl p-3 md:p-4 mb-8 md:mb-12 flex flex-row gap-4 items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 flex-1">
            <form action="/products" className="hidden md:flex relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    name="q"
                    defaultValue={q}
                    placeholder="Search products..." 
                    className="pl-12 h-12 bg-muted/30 border-none rounded-2xl font-bold text-sm focus-visible:ring-brand/30"
                />
            </form>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                {products.length} Items
            </p>
          </div>

          <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="outline" className="h-10 md:h-12 rounded-2xl font-bold uppercase text-[10px] flex items-center gap-2 min-w-[120px] md:min-w-[160px] justify-between border-white/5 bg-muted/20">
                                Sort: Newest
                                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-brand" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-white/5 shadow-2xl bg-background/95 backdrop-blur-xl">
                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase cursor-pointer">Newest First</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase cursor-pointer">Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase cursor-pointer">Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase cursor-pointer">Best Rating</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex bg-muted/30 p-1 rounded-2xl border border-white/5">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background shadow-sm">
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground">
                    <List className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-36 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto pr-4 scrollbar-hide">
            <ProductFilters 
                categories={filterCategories} 
                brands={brands} 
                activeCategory={categoryFilter}
                activeBrand={brandFilter}
            />
          </aside>

          {/* Product Grid - 2 Column Mobile */}
          <div className="flex-1">
            {serializedProducts.length === 0 ? (
              <div className="h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-white/5 text-center p-8">
                <div className="bg-brand/10 w-16 md:w-20 h-16 md:h-20 rounded-3xl flex items-center justify-center mb-6">
                    <Search className="h-8 md:h-10 w-8 md:w-10 text-brand" />
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">No results found</h2>
                <p className="text-muted-foreground max-w-[240px] md:max-w-xs mx-auto text-xs font-medium">
                    Try adjusting your filters to find what you're looking for.
                </p>
                <Button variant="outline" className="mt-8 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-2 hover:bg-brand hover:text-black hover:border-brand transition-all">
                    Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                {serializedProducts.map((product: any) => (
                  <div key={product.id} className="block md:hidden">
                    <MobileProductCard product={product} />
                  </div>
                ))}
                {serializedProducts.map((product: any) => (
                  <div key={`${product.id}-desktop`} className="hidden md:block">
                    <PremiumProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {serializedProducts.length > 0 && (
                <div className="mt-16 md:mt-20 flex flex-col items-center gap-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        Page 1 of 4
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-10 md:h-12 w-10 md:w-12 rounded-xl border-white/5" disabled>
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </Button>
                        <Button className="h-10 md:h-12 w-10 md:w-12 rounded-xl bg-brand text-black font-black text-xs">1</Button>
                        <Button variant="outline" className="h-10 md:h-12 w-10 md:w-12 rounded-xl border-white/5 font-black text-xs hover:text-brand">2</Button>
                        <Button variant="outline" className="h-10 md:h-12 w-10 md:w-12 rounded-xl border-white/5">
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Recommended Section - Mobile Snap Scrolling */}
        {!q && !categoryFilter && !brandFilter && serializedProducts.length > 0 && (
            <section className="mt-24 md:mt-32 pt-16 md:pt-24 border-t border-white/5">
                <div className="flex items-end justify-between mb-8 md:mb-12 px-2">
                    <div>
                        <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter">You May <span className="text-brand">Like</span></h2>
                        <p className="text-muted-foreground mt-1 text-[10px] md:text-sm font-bold uppercase tracking-widest">Selected for your goals</p>
                    </div>
                    <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] group">
                        View All <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-2" />
                    </Button>
                </div>
                
                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x">
                    {serializedProducts.slice(0, 5).map((product: any) => (
                        <div key={`rec-${product.id}`} className="min-w-[180px] md:min-w-[320px] snap-start">
                            <MobileProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>

      {/* Floating Filter FAB - Mobile Only */}
      <div className="md:hidden fixed bottom-24 right-6 z-50">
        <Sheet>
            <SheetTrigger
                render={
                    <Button className="h-14 w-14 rounded-full bg-brand text-black shadow-[0_15px_30px_rgba(245,166,35,0.4)] border border-white/20 active:scale-90 transition-transform">
                        <Filter className="h-6 w-6" />
                    </Button>
                }
            />
            <SheetContent side="bottom" className="h-[85vh] p-0 border-t-0 rounded-t-[3rem] overflow-hidden bg-background/95 backdrop-blur-2xl">
                <div className="h-full flex flex-col">
                    <div className="h-1.5 w-12 bg-white/10 rounded-full mx-auto mt-4 mb-2" />
                    <SheetHeader className="p-8 pb-4">
                        <SheetTitle className="text-3xl font-black uppercase tracking-tighter">Refine</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-8 pt-4">
                        <ProductFilters 
                            categories={filterCategories} 
                            brands={brands} 
                            activeCategory={categoryFilter}
                            activeBrand={brandFilter}
                        />
                    </div>
                    <div className="p-8 border-t border-white/5 bg-muted/20">
                        <Button className="w-full h-16 bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest rounded-2xl shadow-xl">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
