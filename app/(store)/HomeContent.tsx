"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* === Components ========================================================= */

function ProductCarouselSection({ title, categories, products }: { title: string, categories: string[], products: any[] }) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || "All");

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category?.name === activeCategory);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">{title}</h2>
            <div className="h-1.5 w-12 bg-brand rounded-full" />
          </div>
          <Link href="/products" className="group text-gray-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:text-black transition-colors">
            Explore All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Pills */}
        {categories && categories.length > 0 && (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-none">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 ${activeCategory === "All"
                ? "bg-black text-white border-black shadow-lg shadow-black/10"
                : "bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 ${activeCategory === cat
                  ? "bg-black text-white border-black shadow-lg shadow-black/10"
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid - 2 columns on mobile, horizontal scroll on desktop */}
        <div className="grid grid-cols-2 md:flex md:gap-6 md:overflow-x-auto pb-10 scrollbar-none gap-4">
          {filteredProducts.length === 0 ? (
            <div className="w-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-100 rounded-3xl">
              No products available in this category yet.
            </div>
          ) : filteredProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-0 md:min-w-[280px] md:max-w-[280px] bg-white rounded-2xl md:rounded-[2rem] border border-gray-50 shadow-sm md:shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col snap-start hover:shadow-md md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 group relative p-3 md:p-6"
            >
              <button className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-all duration-300 z-10 hover:scale-110">
                <Heart className="h-6 w-6" />
              </button>

              <div className="relative aspect-square mb-6">
                <Link href={`/products/${product.slug}`}>
                  <Image
                    src={product.images?.[0] || "https://img3.hkrtcdn.com/23006/prd_2300532-MuscleTech-Mass-Tech-Extreme-2000-6.6-lb-Triple-Chocolate-Brownie-India_c_l.jpg"}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out p-2"
                  />
                </Link>
                {/* Subtle glow behind product */}
                <div className="absolute inset-0 bg-brand/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              <div className="flex flex-col flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                    4.5 <Star className="h-2.5 w-2.5 fill-current" />
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Stock</span>
                </div>

                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-xs md:text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-2 md:mb-3 hover:text-brand transition-colors h-8 md:h-12">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <span className="text-base md:text-xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                  {product.comparePrice && (
                    <span className="text-[10px] md:text-sm text-gray-400 line-through font-medium">₹{Number(product.comparePrice).toLocaleString()}</span>
                  )}
                </div>

                <div className="flex-1" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-auto">
                  <Button
                    render={<Link href={`/products/${product.slug}`} />}
                    className="h-9 md:h-11 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-brand hover:text-black rounded-lg md:rounded-xl shadow-none transition-all"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* === Main Page Content =========================================== */

export default function HomeContent({ products, categories, banners = [] }: { products: any[], categories: any[], banners?: any[] }) {
  const [currentBanner, setCurrentBanner] = useState(0);

  const proteinProducts = products.filter(p => p.category?.name.toLowerCase().includes("protein"));
  const gainerProducts = products.filter(p => p.category?.name.toLowerCase().includes("gainer"));
  const fitFoodProducts = products.filter(p => p.category?.name.toLowerCase().includes("food") || p.category?.name.toLowerCase().includes("snack"));

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">

      {/* === Full-Width Hero Banners =========================================== */}
      {banners.length > 0 && (
        <section className="relative w-full overflow-hidden group bg-gray-50 md:bg-black pt-4 px-4 md:p-0">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/7] rounded-3xl md:rounded-none overflow-hidden bg-black shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)] md:shadow-none">
            {banners.map((banner, index) => {
              const isActive = index === currentBanner;
              const content = (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.label}
                    fill
                    priority={isActive}
                    className="object-cover"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-black/5 md:bg-black/10" />
                </div>
              );

              if (banner.link && isActive) {
                return (
                  <Link href={banner.link} key={banner.id}>
                    {content}
                  </Link>
                );
              }
              return content;
            })}
          </div>

          {/* Carousel Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? 'bg-white w-6' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* === Sections =============================================== */}
      <ProductCarouselSection
        title="Top Protein Picks"
        categories={categories.filter(c => c.name.toLowerCase().includes("protein")).map(c => c.name)}
        products={proteinProducts}
      />

      <ProductCarouselSection
        title="Gaining Zone"
        categories={categories.filter(c => c.name.toLowerCase().includes("gainer")).map(c => c.name)}
        products={gainerProducts}
      />

      <ProductCarouselSection
        title="Fit Food Range"
        categories={[]}
        products={fitFoodProducts}
      />

      {/* ── Latest Arrivals ───────────────────────────────────────── */}
      <ProductCarouselSection
        title="Latest Arrivals"
        categories={[]}
        products={products.slice(0, 8)}
      />

      {/* === Trust Bar ============================================== */}
      <section className="py-12 md:py-24 bg-white border-t border-gray-50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center gap-3 md:gap-5 group cursor-default">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-teal-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-teal-100">
                <ShieldCheck className="h-7 w-7 md:h-10 md:w-10 text-teal-600" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">Authentic</span>
                <span className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Products</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 md:gap-5 group cursor-default">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-orange-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-orange-100">
                <Truck className="h-7 w-7 md:h-10 md:w-10 text-orange-600" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">Fast Delivery</span>
                <span className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Quick Dispatch</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 md:gap-5 group cursor-default">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-purple-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-purple-100">
                <Tag className="h-7 w-7 md:h-10 md:w-10 text-purple-600" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">Wholesale</span>
                <span className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Lowest Prices</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 md:gap-5 group cursor-default">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-blue-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-blue-100">
                <MapPin className="h-7 w-7 md:h-10 md:w-10 text-blue-600" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">Walk-In</span>
                <span className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Visit Agra Store</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
