"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useCart from "@/hooks/useCart";
import { useEffect, useState } from "react";

export default function MobileTabBar() {
  const pathname = usePathname();
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemCount = isMounted ? cart.items.length : 0;

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Cart", href: "/cart", icon: ShoppingCart, count: cartItemCount },
    { name: "Orders", href: "/orders", icon: ClipboardList },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors ${
              isActive ? "text-brand" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="h-6 w-6" />
              {tab.count !== undefined && tab.count > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-brand text-black border-2 border-background">
                  {tab.count}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
