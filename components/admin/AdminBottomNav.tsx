"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomLinks = [
  { name: "Dash", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50 px-2 py-2 safe-area-pb shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        
        {bottomLinks.slice(0, 2).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className="flex-1 flex flex-col items-center justify-center py-1 relative group"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-brand text-black" : "text-muted-foreground group-hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {link.name}
              </span>
            </Link>
          );
        })}

        {/* Central FAB - Quick Add Product */}
        <div className="relative flex-1 flex justify-center -mt-8">
            <Link href="/admin/products/new">
                <div className="bg-foreground text-background h-14 w-14 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] border-4 border-background transition-transform active:scale-95 hover:bg-brand hover:text-black">
                    <Plus className="h-7 w-7" />
                </div>
            </Link>
        </div>

        {bottomLinks.slice(2, 4).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className="flex-1 flex flex-col items-center justify-center py-1 relative group"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-brand text-black" : "text-muted-foreground group-hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {link.name}
              </span>
            </Link>
          );
        })}

      </div>
    </div>
  );
}
