"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useCart from "@/hooks/useCart";

interface MobileProductCardProps {
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
  };
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cart = useCart();
  
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-background rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 shadow-sm active:scale-95 active:shadow-inner"
    >
      {/* Image Section */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-110"
          )}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
                <Badge className="bg-brand text-black font-black uppercase tracking-widest text-[8px] py-0.5 px-2 border-none rounded-full shadow-lg">
                    -{discount}%
                </Badge>
            )}
            <Badge variant="outline" className="bg-black/20 backdrop-blur-md text-white border-white/10 font-bold text-[8px] py-0.5 px-2 rounded-full flex items-center gap-1">
                <Star className="h-2 w-2 fill-brand text-brand" />
                {product.rating || "4.8"}
            </Badge>
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-white active:text-black transition-colors">
            <Heart className="h-4 w-4" />
        </button>

        {/* Floating Add to Cart for Mobile */}
        <div className="absolute bottom-3 right-3">
            <Button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="icon"
                className="h-10 w-10 bg-brand text-black hover:bg-brand/90 rounded-2xl shadow-xl border border-white/10"
            >
                {product.stock > 0 ? (
                  <ShoppingCart className="h-4 w-4" />
                ) : (
                  <span className="text-[8px] font-black uppercase">0</span>
                )}
            </Button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground truncate">{product.brand}</p>
        
        <Link href={`/products/${product.slug}`} className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight line-clamp-2">
                {product.name}
            </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-black">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
                <span className="text-[10px] text-muted-foreground line-through decoration-brand/30">
                    ₹{product.comparePrice.toLocaleString()}
                </span>
            )}
        </div>
      </div>

      {/* Luxury Soft Shadow Overlay */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[2.5rem]" />
    </motion.div>
  );
}
