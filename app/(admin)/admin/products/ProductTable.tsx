"use client";

import { MoreHorizontal, Edit, Trash, ExternalLink, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  if (initialProducts.length === 0) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No products found in database.</p>
        <p className="text-xs text-muted-foreground">Start by adding your first product using the button above.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <Checkbox />
              </th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4 text-center">
                  <Checkbox />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded border bg-muted overflow-hidden shrink-0">
                      <img 
                        src={product.images?.[0] || "https://img3.hkrtcdn.com/23006/prd_2300532-MuscleTech-Mass-Tech-Extreme-2000-6.6-lb-Triple-Chocolate-Brownie-India_c_l.jpg"} 
                        alt={product.name} 
                        className="object-cover h-full w-full" 
                      />
                    </div>
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider">
                    {product.category?.name || "Uncategorized"}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-bold">₹{Number(product.price).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`font-bold ${product.stock < 10 ? 'text-destructive' : ''}`}>
                      {product.stock}
                    </span>
                    <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${product.stock < 10 ? 'bg-destructive' : 'bg-green-500'}`} 
                            style={{ width: `${Math.min(100, product.stock * 2)}%` }}
                        />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`font-black uppercase text-[10px] tracking-widest ${
                    product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <ProductActions product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y">
        {initialProducts.map((product) => (
          <div key={product.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox className="mt-1" />
                <div className="relative h-14 w-14 rounded-lg border bg-muted overflow-hidden shrink-0">
                  <img 
                    src={product.images?.[0] || "https://img3.hkrtcdn.com/23006/prd_2300532-MuscleTech-Mass-Tech-Extreme-2000-6.6-lb-Triple-Chocolate-Brownie-India_c_l.jpg"} 
                    alt={product.name} 
                    className="object-cover h-full w-full" 
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{product.brand}</p>
                </div>
              </div>
              <ProductActions product={product} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Price</p>
                <p className="font-black">₹{Number(product.price).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Stock</p>
                <div className="flex items-center gap-2">
                  <span className={`font-black ${product.stock < 10 ? 'text-destructive' : ''}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Category</p>
                <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider px-2 py-0">
                  {product.category?.name || "Uncategorized"}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</p>
                <Badge className={`font-black uppercase text-[9px] tracking-widest px-2 py-0 ${
                  product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductActions({ product }: { product: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <Link href={`/admin/products/${product.id}/edit`}>
          <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
            <Edit className="h-3 w-3 mr-2" /> Edit Product
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          <Power className="h-3 w-3 mr-2" /> Toggle Active
        </DropdownMenuItem>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          <ExternalLink className="h-3 w-3 mr-2" /> View in Store
        </DropdownMenuItem>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer text-destructive">
          <Trash className="h-3 w-3 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
