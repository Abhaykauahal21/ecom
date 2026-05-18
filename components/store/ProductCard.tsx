"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Decimal } from "@prisma/client/runtime/library";
import useCart from "@/hooks/useCart";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | Decimal;
    comparePrice?: number | Decimal | null;
    images: string[];
    brand: string;
    isFeatured?: boolean;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();

  const discount = product.comparePrice
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-brand text-black font-bold">
            {discount}% OFF
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Link href={`/products/${product.slug}`}>
                <Button size="icon" variant="secondary" className="rounded-full">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
            <Button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="icon" 
                className="rounded-full bg-brand text-black hover:bg-brand/90"
            >
                <ShoppingCart className="h-4 w-4" />
            </Button>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.brand}
        </div>
        <Link href={`/products/${product.slug}`} className="block group-hover:text-brand transition-colors">
          <h3 className="font-bold text-sm md:text-base line-clamp-1">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg">₹{Number(product.price).toLocaleString()}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{Number(product.comparePrice).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
            onClick={handleAddToCart}
            className="w-full bg-foreground text-background hover:bg-brand hover:text-black transition-colors"
            disabled={product.stock === 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
