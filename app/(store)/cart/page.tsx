"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCart from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { getShippingConfig } from "@/app/actions/settings";

export default function CartPage() {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

  useEffect(() => {
    setIsMounted(true);
    async function loadConfig() {
      try {
        const res = await getShippingConfig();
        if (res.success && res.config) {
          setShippingCharge(res.config.shippingCharge);
          setFreeShippingThreshold(res.config.freeShippingThreshold);
        }
      } catch (error) {
        console.error("Error loading shipping config in cart:", error);
      }
    }
    loadConfig();
  }, []);

  if (!isMounted) return null;

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = total >= freeShippingThreshold ? 0 : shippingCharge;

  console.log("CART_DEBUG:", {
    total,
    freeShippingThreshold,
    shippingCharge,
    shipping,
    types: {
      total: typeof total,
      freeShippingThreshold: typeof freeShippingThreshold,
      shippingCharge: typeof shippingCharge,
      shipping: typeof shipping
    }
  });

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-muted p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our premium supplements to get started.
          </p>
          <Link href="/products">
            <Button className="bg-brand text-black hover:bg-brand/90 font-bold px-8">
              Explore Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4 sm:gap-6">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} className="hover:text-brand transition-colors">
                          <h3 className="font-bold text-base sm:text-lg line-clamp-1">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.flavor && `${item.flavor}`}
                          {item.flavor && item.size && " | "}
                          {item.size && `${item.size}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => cart.removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center border rounded-md h-9">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-md bg-muted/30">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tight">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (Included)</span>
                  <span className="font-bold">₹{Math.round(total * 0.18).toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-lg font-bold">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand">₹{(total + shipping).toLocaleString()}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full h-12 bg-foreground text-background hover:bg-brand hover:text-black font-bold text-lg group">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <div className="pt-4 flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                   Secure Payment with Razorpay
                </p>
                <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                    {/* Mock payment icons */}
                    <div className="h-4 w-8 bg-foreground/20 rounded" />
                    <div className="h-4 w-8 bg-foreground/20 rounded" />
                    <div className="h-4 w-8 bg-foreground/20 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
