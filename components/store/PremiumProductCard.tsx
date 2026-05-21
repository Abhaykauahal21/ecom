"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useCart from "@/hooks/useCart";

import { getProductPrices } from "@/lib/pricing";

interface PremiumProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    brand: string;
    rating?: number;
    stock: number;
    isFeatured?: boolean;
    sale?: {
      isActive: boolean;
      discountPercent: number;
      announcementText: string;
    } | null;
  };
}

export default function PremiumProductCard({ product }: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cart = useCart();
  
  const { price, comparePrice, isOnSale, discountPercent } = getProductPrices(product as any);

  const discount = isOnSale 
    ? discountPercent 
    : (product.comparePrice
      ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
      : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-background rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2"
    >
      {/* Image Section */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
            >
                <Heart className="h-5 w-5" />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
            >
                <Eye className="h-5 w-5" />
            </motion.button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            {discount > 0 && (
                <Badge className="bg-brand text-black font-black uppercase tracking-widest text-[10px] py-1 px-3 border-none">
                    -{discount}%
                </Badge>
            )}
            {product.stock < 10 && product.stock > 0 && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 font-black uppercase tracking-widest text-[10px] py-1 px-3">
                    Low Stock
                </Badge>
            )}
        </div>

        {/* Quick Add Overlay */}
        <AnimatePresence>
            {isHovered && product.stock > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-6 left-6 right-6"
                >
                    <Button 
                        onClick={handleAddToCart}
                        className="w-full h-12 bg-white text-black hover:bg-brand hover:text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-2xl"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Quick Add
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
        
        {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white font-black uppercase tracking-[0.2em] text-sm border-2 border-white/40 px-6 py-2 rounded-full">
                    Out of Stock
                </span>
            </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 fill-brand text-brand" />
                {product.rating || "4.8"}
            </div>
        </div>
        
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-2xl font-black">₹{price.toLocaleString()}</span>
                {comparePrice && (
                    <span className="text-xs text-muted-foreground line-through decoration-brand/50">
                        ₹{comparePrice.toLocaleString()}
                    </span>
                )}
            </div>
            
            <Button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="h-12 w-12 bg-brand text-black hover:bg-brand/90 rounded-2xl shadow-xl shadow-brand/20 border border-white/10"
            >
                {product.stock > 0 ? (
                  <ShoppingCart className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-black">0</span>
                )}
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
