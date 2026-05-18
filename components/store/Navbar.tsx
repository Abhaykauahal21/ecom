"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { UserButton, useAuth } from "@clerk/nextjs";
import useCart from "@/hooks/useCart";
import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemCount = isMounted ? cart.items.length : 0;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/#categories" },
    { name: "Deals", href: "/products?sort=discount" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-black group-hover:text-brand transition-colors">
              KAVYA<span className="text-brand group-hover:text-black">BOSS</span>
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 transition-colors hover:text-black group ${pathname === link.href ? "text-black" : "text-gray-400"
                }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full ${pathname === link.href ? "w-full" : ""}`} />
            </Link>
          ))}
        </nav>

        {/* Search, Cart, Auth */}
        <div className="flex items-center space-x-2 md:space-x-6">
          <form action="/products" className="hidden lg:flex relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand transition-colors" />
            <Input
              name="q"
              type="search"
              placeholder="Search products..."
              className="pl-10 h-11 bg-gray-50 border-transparent focus:bg-white focus:border-brand/20 focus:ring-0 rounded-2xl transition-all"
            />
          </form>

          <div className="flex items-center space-x-1 md:space-x-3">
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl hover:bg-gray-50 group">
                <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black bg-brand text-black border-2 border-white">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {userId ? (
              <UserButton />
            ) : (
              <Button render={<Link href="/sign-in" />} variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl hover:bg-gray-50">
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-xl hover:bg-gray-50" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="rounded-l-3xl border-none shadow-2xl">
                <SheetHeader>
                  <SheetTitle className="text-left font-black tracking-tighter text-2xl">MENU</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6 mt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xl font-bold hover:text-brand transition-colors flex items-center justify-between group"
                    >
                      {link.name}
                      <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ))}
                  <div className="pt-6 border-t border-gray-100">
                    <Link href="/orders" className="text-xl font-bold hover:text-brand flex items-center justify-between group">
                      My Orders
                      <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
