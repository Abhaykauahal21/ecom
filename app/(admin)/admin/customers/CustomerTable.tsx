"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Mail, Eye, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function CustomerTable({ initialCustomers }: { initialCustomers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  let filteredCustomers = initialCustomers;
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredCustomers = filteredCustomers.filter(
      (c) =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery)
    );
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers by name or email..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="font-bold uppercase text-xs">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No customers found.</td></tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-black uppercase">
                        {customer.name ? customer.name.charAt(0) : "G"}
                      </div>
                      <div>
                        <p className="font-bold">{customer.name || "Guest User"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{customer.ordersCount}</td>
                  <td className="px-6 py-4 font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CustomerActions customerId={customer.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No customers found.</div>
          ) : filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand/20 text-brand flex items-center justify-center font-black shrink-0 uppercase">
                    {customer.name ? customer.name.charAt(0) : "G"}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{customer.name || "Guest User"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[180px]">{customer.email}</p>
                  </div>
                </div>
                <CustomerActions customerId={customer.id} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Spent</p>
                  <p className="font-black text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Orders</p>
                  <p className="font-bold">{customer.ordersCount} total</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</p>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Join Date</p>
                  <p className="font-bold text-xs">{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerActions({ customerId }: { customerId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          <Eye className="h-4 w-4 mr-2" /> View Profile
        </DropdownMenuItem>
        <Link href={`/admin/orders?search=${customerId}`}>
            <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
            <ShoppingBag className="h-4 w-4 mr-2" /> Order History
            </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
