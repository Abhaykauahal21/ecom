"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Banners", href: "/admin/banners", icon: ImageIcon },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex flex-col w-64 bg-background border-r h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <Image 
            src="/logocompany.jpg" 
            alt="Kavya Boss Nutrition Logo" 
            width={120} 
            height={40} 
            className="object-contain h-8 w-auto rounded-full shadow-sm"
            priority
          />
          <span className="text-xl font-black tracking-tighter text-foreground leading-none">
            KAVYA BOSS<br/><span className="text-brand text-sm">NUTRITION</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${isActive
                  ? "bg-brand text-black font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-4">
        <Link href="/admin/products/new">
          <Button className="w-full bg-foreground text-background hover:bg-brand hover:text-black font-bold">
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold">Admin User</span>
              <span className="text-[10px] text-muted-foreground">admin@suppstore.com</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
