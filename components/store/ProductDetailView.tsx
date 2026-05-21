"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Plus,
  Minus,
  Check,
  Zap,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import PremiumProductGallery from "@/components/store/PremiumProductGallery";
import ProductBento from "@/components/store/ProductBento";
import ProductNutrition from "@/components/store/ProductNutrition";
import ProductReviews from "@/components/store/ProductReviews";
import ProductFAQ from "@/components/store/ProductFAQ";
import ProductCard from "@/components/store/ProductCard";
import useCart from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { getProductPrices } from "@/lib/pricing";

interface ProductDetailViewProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const basePriceObj = getProductPrices({
    price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
    comparePrice: selectedVariant 
      ? (selectedVariant.comparePrice ? Number(selectedVariant.comparePrice) : null) 
      : (product.comparePrice ? Number(product.comparePrice) : null),
    sale: product.sale
  });

  const price = basePriceObj.price;
  const comparePrice = basePriceObj.comparePrice;
  const isOnSale = basePriceObj.isOnSale;
  const discountPercent = basePriceObj.discountPercent;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    cart.addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: price,
      image: product.images?.[0] || "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800",
      quantity: quantity,
      stock: stock,
      flavor: selectedVariant?.name,
    });
  };

  const handleBuyItNow = () => {
    cart.addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: price,
      image: product.images?.[0] || "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800",
      quantity: quantity,
      stock: stock,
      flavor: selectedVariant?.name,
    });
    router.push("/cart");
  };

  if (!isMounted) return null;

  const discount = isOnSale 
    ? discountPercent 
    : (comparePrice
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Gallery (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <PremiumProductGallery images={product.images} />
            
            {/* Desktop-only extra info below gallery */}
            <div className="hidden lg:grid grid-cols-3 gap-8 mt-16">
                <div className="flex flex-col gap-4">
                    <div className="bg-brand/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Zap className="h-6 w-6 text-brand" />
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-sm">Rapid Absorption</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Hydrolyzed peptides for near-instant muscle fueling.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="bg-brand/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-brand" />
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-sm">Post-Workout Recovery</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Optimal window recovery with 5.5g BCAAs per scoop.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="bg-brand/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Check className="h-6 w-6 text-brand" />
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-sm">Informed Choice</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Every batch is tested for banned substances.</p>
                </div>
            </div>
          </div>

          {/* Right: Purchase Info (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="sticky top-32 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-brand/30 text-brand bg-brand/5 font-black uppercase tracking-[0.2em] text-[10px] px-3">
                        {product.isNew ? "New Formula" : "Elite Series"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Star className="h-3 w-3 fill-brand text-brand" />
                        <span className="text-foreground">{product.rating || "4.9"}</span>
                        <span>({product.reviewsCount || "1.2k"} Reviews)</span>
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    {product.name}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {product.description}
                </p>
              </div>

              <div className="space-y-6 bg-muted/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black">₹{price.toLocaleString()}</span>
                    {comparePrice && (
                        <span className="text-xl text-muted-foreground line-through decoration-brand/50">
                            ₹{comparePrice.toLocaleString()}
                        </span>
                    )}
                    {discount > 0 && (
                        <Badge className="bg-brand text-black ml-auto font-black uppercase tracking-widest text-[10px]">Save {discount}%</Badge>
                    )}
                </div>

                <Separator className="bg-white/10" />

                {/* Variant Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Variant</label>
                      <span className="text-xs font-bold text-brand">{selectedVariant?.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (quantity > variant.stock) {
                              setQuantity(variant.stock);
                            }
                          }}
                          className={cn(
                              "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-300",
                              selectedVariant?.id === variant.id 
                                  ? "border-brand bg-brand text-black shadow-[0_0_20px_rgba(0,255,135,0.2)]" 
                                  : "border-white/5 bg-background hover:border-white/20"
                          )}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quantity</label>
                    {stock > 0 && stock <= 10 && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase">Only {stock} left in stock</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                    <div className="flex items-center bg-background border-2 border-white/5 rounded-2xl h-14 px-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-brand/10 hover:text-brand"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-black text-lg">{quantity}</span>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-brand/10 hover:text-brand"
                            onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                            disabled={quantity >= stock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button 
                        onClick={handleAddToCart}
                        disabled={stock <= 0}
                        className="flex-1 h-14 bg-brand text-black hover:bg-brand/90 text-lg font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,135,0.3)] rounded-2xl"
                    >
                        {stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={stock <= 0}
                    onClick={handleBuyItNow}
                    className="h-14 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background text-lg font-black uppercase tracking-widest rounded-2xl"
                  >
                    Buy It Now
                  </Button>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                        <Truck className="h-4 w-4 text-brand" />
                        <span>Fast delivery: <span className="text-foreground">Get it within 2-3 days</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-brand" />
                        <span>Secure checkout with <span className="text-foreground">Razorpay</span></span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Sections */}
      <ProductBento />
      <ProductNutrition />
      <ProductReviews />
      <ProductFAQ />

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
              <div className="flex items-end justify-between mb-12">
                  <div>
                      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Complete Your <span className="text-brand">Stack</span></h2>
                      <p className="text-muted-foreground mt-2">Pair it with these for maximum results.</p>
                  </div>
                  <Button variant="ghost" className="font-black uppercase tracking-widest text-xs group">
                      View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {relatedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                  ))}
              </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA */}
      <AnimatePresence>
        {stock > 0 && (
          <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="lg:hidden fixed bottom-16 left-0 z-40 w-full p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 flex items-center gap-4"
          >
              <div className="flex-1">
                  {comparePrice && (
                    <span className="text-xs text-muted-foreground line-through block font-bold">₹{comparePrice.toLocaleString()}</span>
                  )}
                  <span className="text-xl font-black block">₹{price.toLocaleString()}</span>
              </div>
              <Button 
                  onClick={handleAddToCart}
                  className="flex-[2] bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest h-14 rounded-2xl shadow-[0_0_20px_rgba(0,255,135,0.3)]"
              >
                  Add to Cart
              </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
