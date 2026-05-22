"use client";

import { useState, useEffect } from "react";
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
  Copy,
  Check,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductPrices } from "@/lib/pricing";

/* === Static Data ========================================================= */

const categoryCards = [
  { name: "Protein", slug: "protein", desc: "Build Muscle", gradient: "from-blue-600 to-indigo-700", icon: "💪" },
  { name: "Gainer", slug: "gainer", desc: "Bulking & Mass", gradient: "from-orange-500 to-red-600", icon: "🏋️‍♂️" },
  { name: "Pre Workout", slug: "pre-workout", desc: "Energy & Focus", gradient: "from-yellow-500 to-orange-600", icon: "⚡" },
  { name: "T-Booster", slug: "t-booster", desc: "Strength & Vitality", gradient: "from-red-600 to-rose-700", icon: "🔥" },
  { name: "Fish Oil", slug: "fish-oil", desc: "Joints & Heart", gradient: "from-teal-500 to-cyan-600", icon: "🐟" },
  { name: "Multivitamins", slug: "multivitamins", desc: "Daily Health", gradient: "from-emerald-500 to-green-600", icon: "🍎" },
  { name: "Creatine", slug: "creatine", desc: "Power & Performance", gradient: "from-purple-600 to-violet-700", icon: "💥" },
  { name: "EAA/BCAA", slug: "eaa-bcaa", desc: "Recovery & Hydration", gradient: "from-pink-500 to-rose-600", icon: "🥤" },
  { name: "Weight Loss", slug: "weight-loss", desc: "Fat Burner", gradient: "from-cyan-500 to-blue-600", icon: "🏃‍♂️" },
  { name: "Snacks", slug: "snacks", desc: "Healthy Bites", gradient: "from-amber-500 to-amber-700", icon: "🍪" }
];

const instaReels = [
  {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-performing-dumbbell-curls-in-a-gym-40552-large.mp4",
    caption: "Crushing arms today! No excuses. 💪 #beastmode #gym",
    likes: "1.2k",
    comments: "142"
  },
  {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-plank-exercise-in-gym-40546-large.mp4",
    caption: "Consistency is key. Core stability focus. ⚡ #fitnessmotivation",
    likes: "948",
    comments: "86"
  },
  {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-man-doing-bench-press-workout-in-gym-40562-large.mp4",
    caption: "Pushing limits on bench press. Let's grow! 🔥 #powerlifting",
    likes: "2.1k",
    comments: "305"
  },
  {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-doing-pushups-in-the-gym-40565-large.mp4",
    caption: "Finishing chest day with slow tempo pushups. 🙌 #calisthenics",
    likes: "839",
    comments: "74"
  }
];

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

        {/* Product Grid - Horizontal Scroll / Swipe-based on mobile */}
        <div className="flex overflow-x-auto pb-10 scrollbar-none gap-4 md:gap-6 snap-x snap-mandatory">
          {filteredProducts.length === 0 ? (
            <div className="w-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-100 rounded-3xl">
              No products available in this category yet.
            </div>
          ) : filteredProducts.map((product) => {
            const { price, comparePrice, isOnSale, discountPercent } = getProductPrices(product);
            const discount = isOnSale 
              ? discountPercent 
              : (product.comparePrice
                ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
                : 0);

            return (
              <div    
                key={product.id}
                className="min-w-[190px] max-w-[190px] sm:min-w-[240px] sm:max-w-[240px] md:min-w-[280px] md:max-w-[280px] shrink-0 bg-white rounded-2xl md:rounded-[2rem] border border-gray-50 shadow-sm md:shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col snap-start hover:shadow-md md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 group relative p-3 md:p-6"
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
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-brand text-black font-black text-[9px] py-0.5 px-2 border-none">
                      {discount}% OFF
                    </Badge>
                  )}
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
                    <span className="text-base md:text-xl font-black text-gray-900">₹{price.toLocaleString()}</span>
                    {comparePrice && (
                      <span className="text-[10px] md:text-sm text-gray-400 line-through font-medium">₹{comparePrice.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="flex-1" />

                  <div className="grid grid-cols-1 gap-2 mt-auto">
                    <Link href={`/products/${product.slug}`} className="w-full">
                      <Button
                        className="w-full h-9 md:h-11 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-brand hover:text-black rounded-lg md:rounded-xl shadow-none transition-all"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* === Main Page Content =========================================== */

interface HomeContentProps {
  products: any[];
  categories: any[];
  banners?: any[];
  activeSale?: any;
  instagramReels?: any[];
}

export default function HomeContent({ products, categories, banners = [], activeSale, instagramReels = [] }: HomeContentProps) {
  const [copied, setCopied] = useState(false);

  const displayReels = instagramReels && instagramReels.length > 0
    ? instagramReels
    : instaReels;

  const proteinProducts = products.filter(p => p.category?.name.toLowerCase().includes("protein"));
  const gainerProducts = products.filter(p => p.category?.name.toLowerCase().includes("gainer"));
  const fitFoodProducts = products.filter(p => p.category?.name.toLowerCase().includes("food") || p.category?.name.toLowerCase().includes("snack"));
  const bestPickProducts = products.filter(p => p.isBestPick || p.category?.slug === "best-pick" || p.category?.name.toLowerCase().includes("best pick"));

  // Combine database categories with static fallback configurations
  const displayCategories = categories && categories.length > 0
    ? categories.map((dbCat) => {
        const staticConfig = categoryCards.find(
          (c) => c.slug === dbCat.slug || c.name.toLowerCase() === dbCat.name.toLowerCase()
        );
        return {
          id: dbCat.id,
          name: dbCat.name,
          slug: dbCat.slug,
          image: dbCat.image as string | null,
          gradient: staticConfig?.gradient || "from-zinc-800 to-zinc-950",
          icon: staticConfig?.icon || "💪",
          desc: staticConfig?.desc || "Premium Supplements",
        };
      })
    : categoryCards.map(c => ({ ...c, id: c.slug, image: null as string | null }));

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const couponCode = activeSale ? activeSale.name.toUpperCase().replace(/\s+/g, "") : "SUMMER";
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      
      {/* === Sale Announcement Strip =========================================== */}
      {activeSale && (
        <div className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-3 px-4 text-center text-xs md:text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 relative z-30 shadow-md">
          <span className="inline-block animate-pulse">⚡ {activeSale.announcementText} ⚡</span>
        </div>
      )}

        

      {/* === Banner and Click-to-Copy Coupon Section =========================================== */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-4 pt-0 pb-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Hero Banner (3/4 width on desktop) */}
          <div className="lg:col-span-3 relative aspect-[16/9] md:aspect-[21/9] rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5 group">
            <Image
            src={
              banners && banners.length > 0
                ? banners.find((b) => b.isActive)?.imageUrl || banners[0].imageUrl
                : "/summer_sale_banner.png"
            }
            alt={
              banners && banners.length > 0
                ? banners.find((b) => b.isActive)?.label || "Banner"
                : "Summer Sale Banner"
            }
          fill
          priority
          className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
            />

            
          </div>

          {/* Interactive Click-to-Copy Coupon Card (1/4 width on desktop) */}
          <div
            onClick={handleCopyCoupon}
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 md:p-5 flex flex-col justify-between text-white cursor-pointer border border-zinc-800 group active:scale-95 transition-all duration-300 h-full min-h-[160px] md:min-h-[200px] mx-4 lg:mx-0"
          >
            {activeSale?.couponImageUrl ? (
              <>
                <Image
                  src={activeSale.couponImageUrl}
                  alt="Coupon Background"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  unoptimized
                />
                {/* Premium dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/80 z-0 pointer-events-none" />
              </>
            ) : (
              <>
                {/* Ambient decorative glowing circles */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-brand/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-brand/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              </>
            )}

            {/* Ticket Notches */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-zinc-800/40 pointer-events-none z-10" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-zinc-800/40 pointer-events-none z-10" />
            {/* Ticket Dashed Separator */}
            <div className="absolute top-1/2 left-4 right-4 border-t border-dashed border-white/20 pointer-events-none z-10" />

            {/* Top Part: Coupon Info */}
            <div className="relative z-10 flex flex-col items-center text-center mt-1 pb-3 md:pb-4">
              <span className="bg-brand/10 text-brand font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full mb-2 md:mb-3 border border-brand/20">
                Special Coupon
              </span>
              <div className="text-3xl md:text-4xl font-black uppercase tracking-tighter select-none font-mono bg-black/50 text-brand px-5 py-1.5 rounded-xl border border-brand/25 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {activeSale ? activeSale.name.toUpperCase().replace(/\s+/g, "") : "SUMMER"}
              </div>
            </div>

            {/* Bottom Part: Action */}
            <div className="relative z-10 flex flex-col items-center pt-3 md:pt-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-300 mb-2 md:mb-3 text-center">
                Tap card to copy coupon code
              </p>
              <div className="bg-brand text-black w-full py-2.5 md:py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg group-hover:bg-white group-hover:shadow-brand/20 transition-all duration-300">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-black animate-bounce" />
                    COPIED!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    COPY CODE
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Chalti Hui Patti (Moving Strip) ============================================== */}
                
                 <div className="w-full bg-brand text-black py-4 font-black uppercase tracking-widest overflow-hidden relative border-y border-black/10 select-none shadow-sm z-20">
        <div className="flex w-[200%] animate-marquee whitespace-nowrap">
          <div className="flex justify-around w-1/2">
            <span className="text-xs md:text-base flex items-center gap-2">★ Trusted by 1000+ Customers</span>
            <span className="text-xs md:text-base flex items-center gap-2">★ 100% Real & Authentic Products</span>
            <span className="text-xs md:text-base flex items-center gap-2">★ Direct Brand Importer</span>
          </div>
          <div className="flex justify-around w-1/2">
            <span className="text-xs md:text-base flex items-center gap-2">★ Trusted by 1000+ Customers</span>
            <span className="text-xs md:text-base flex items-center gap-2">★ 100% Real & Authentic Products</span>
            <span className="text-xs md:text-base flex items-center gap-2">★ Direct Brand Importer</span>
          </div>
        </div>
      </div>
      {/* === Shop by Category ============================================== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="mb-10 space-y-1">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">Shop by Category</h2>
            <div className="h-1.5 w-12 bg-brand rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {displayCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="relative aspect-square overflow-hidden rounded-3xl group shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full"
              >
                {cat.image ? (
                  <img
                    src={cat.image.startsWith("//") ? `https:${cat.image}` : cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`absolute inset-0 p-4 md:p-6 flex flex-col justify-between text-white bg-gradient-to-br ${cat.gradient} h-full w-full`}>
                    <div className="absolute right-3 bottom-3 text-3xl md:text-5xl opacity-20 group-hover:scale-110 transition-transform duration-300">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-sm md:text-lg uppercase tracking-tight leading-tight">{cat.name}</h4>
                      <p className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">{cat.desc}</p>
                    </div>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/95 bg-white/10 w-fit px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-colors duration-300">
                      Shop Now →
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === Kavya Boss Nutrition's Best Pick Section ============================================== */}
      <section className="py-16 bg-gray-50 overflow-hidden border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">
                Kavya Boss <span className="text-brand">Nutrition's Best Pick</span>
              </h2>
              <div className="h-1.5 w-12 bg-brand rounded-full" />
            </div>
            <Link href="/products?category=best-pick" className="group text-gray-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:text-black transition-colors">
              Explore Best Picks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {bestPickProducts.length === 0 ? (
            <div className="w-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-200 rounded-3xl bg-white">
              No products assigned to Best Picks yet. Add them in `/admin/sales` or `/admin/products`!
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-10 scrollbar-none gap-4 md:gap-6 snap-x snap-mandatory">
              {bestPickProducts.map((product) => {
                const { price, comparePrice, isOnSale, discountPercent } = getProductPrices(product);
                const discount = isOnSale 
                  ? discountPercent 
                  : (product.comparePrice
                    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
                    : 0);

                return (
                  <div
                    key={product.id}
                    className="min-w-[190px] max-w-[190px] sm:min-w-[240px] sm:max-w-[240px] md:min-w-[280px] md:max-w-[280px] shrink-0 bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm md:shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col snap-start hover:shadow-md md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative p-3 md:p-6"
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
                      {discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-brand text-black font-black text-[9px] py-0.5 px-2 border-none">
                          {discount}% OFF
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-brand/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    <div className="flex flex-col flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                          4.9 <Star className="h-2.5 w-2.5 fill-current" />
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Best Choice</span>
                      </div>

                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-xs md:text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-2 md:mb-3 hover:text-brand transition-colors h-8 md:h-12">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <span className="text-base md:text-xl font-black text-gray-900">₹{price.toLocaleString()}</span>
                        {comparePrice && (
                          <span className="text-[10px] md:text-sm text-gray-400 line-through font-medium">₹{comparePrice.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="flex-1" />

                      <div className="grid grid-cols-1 gap-2 mt-auto">
                        <Link href={`/products/${product.slug}`} className="w-full">
                          <Button
                            className="w-full h-9 md:h-11 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-brand hover:text-black rounded-lg md:rounded-xl shadow-none transition-all"
                          >
                            Buy Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* === Products Lists Section =============================================== */}
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

      {/* === Join Our Insta (Instagram Reels Integration) ============================================== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 flex items-center justify-center gap-2">
              <FaInstagram className="h-8 w-8 text-pink-600 animate-pulse" />
              Join Our <span className="text-brand">Insta</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest">
              Follow us @kavyabossnutrition for daily fitness motivation & reels
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {displayReels.map((reel, idx) => (
              <a
                key={reel.id || idx}
                href={reel.instagramUrl || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[9/16] rounded-3xl overflow-hidden shadow-lg border border-white/10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-black cursor-pointer"
              >
                {/* Loop Video */}
                <video
                  src={reel.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />

                {/* Dark gradients on bottom and top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Reels Icon/Badge */}
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full text-white shadow-lg">
                  <FaInstagram className="h-4.5 w-4.5" />
                </div>

                {/* Overlay Text Details */}
                <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-brand text-black font-black text-[9px] flex items-center justify-center shadow-md">
                      KB
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">kavyaboss</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/85 line-clamp-1 truncate">{reel.caption || "View Reel"}</p>
                  <div className="flex gap-4 mt-2.5 text-[9px] font-black uppercase tracking-widest text-brand">
                    <span>❤️ {reel.likes || "1.2k"}</span>
                    <span>💬 {reel.comments || "120"}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* === Trust Bar ============================================== */}
      <section className="py-12 md:py-24 bg-white border-t border-gray-50 relative overflow-hidden">
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
