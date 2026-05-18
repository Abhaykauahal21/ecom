"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCart from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

export default function CartDrawer({ children }: { children: React.ReactElement }) {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <>{children}</>;

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Use render prop to merge trigger behavior onto children (Button),
          avoiding nested <button> elements */}
      <SheetTrigger render={children} />
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between font-black uppercase tracking-tight">
            Your Cart
            <Badge className="bg-brand text-black">{cart.items.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
              <div className="bg-muted p-4 rounded-full">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-bold">Your cart is empty</p>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="font-bold uppercase text-xs"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                        <button onClick={() => cart.removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                        {item.flavor} / {item.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded h-7">
                        <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="px-2">
                          <Minus className="h-2 w-2" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} 
                          className="px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-2 w-2" />
                        </button>
                      </div>
                      <span className="font-black text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <SheetFooter className="p-6 border-t bg-muted/20">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                <span className="text-xl font-black">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                Shipping &amp; taxes calculated at checkout
              </p>
              <div className="grid gap-2">
                <Button
                  render={<Link href="/checkout" />}
                  onClick={() => setIsOpen(false)}
                  className="w-full h-12 bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest"
                >
                  Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  render={<Link href="/cart" />}
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="w-full font-bold uppercase text-xs"
                >
                  View Full Cart
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
