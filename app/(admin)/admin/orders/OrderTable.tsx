"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrderTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders based on status tab
  let filteredOrders = orders;
  if (filter !== "all") {
    filteredOrders = orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());
  }

  // Filter by search query (id, customer name, email)
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(lowerQuery) ||
        o.user?.name?.toLowerCase().includes(lowerQuery) ||
        o.user?.email?.toLowerCase().includes(lowerQuery)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full md:w-auto">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Pending</TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Shipped</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-10 h-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="outline" className="h-10 font-bold uppercase text-xs">
                <Filter className="h-4 w-4 mr-2" />
                Filter
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                ) : filteredOrders.map((order) => {
                  const itemsCount = order.orderItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const customerName = order.user?.name || "Unknown";
                  const customerEmail = order.user?.email || "No email";
                  const displayId = order.id.includes('_') ? order.id.split('_')[1] : order.id.slice(-8).toUpperCase();
                  
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold uppercase">{displayId}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold line-clamp-1">{customerName}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`font-black uppercase text-[10px] tracking-widest ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                          order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-brand/10 text-brand'
                        }`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {order.paymentStatus || "PENDING"}
                              </span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold">₹{Number(order.totalAmount).toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <OrderActions orderId={order.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No orders found.</div>
            ) : filteredOrders.map((order) => {
               const itemsCount = order.orderItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
               const customerName = order.user?.name || "Unknown";
               const displayId = order.id.includes('_') ? order.id.split('_')[1] : order.id.slice(-8).toUpperCase();

               return (
                <div key={order.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-sm leading-none line-clamp-1">{customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{displayId}</p>
                    </div>
                    <OrderActions orderId={order.id} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</p>
                      <Badge className={`font-black uppercase text-[9px] tracking-widest px-2 py-0 ${
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-brand/10 text-brand'
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Payment</p>
                      <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.paymentStatus || "PENDING"}
                          </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total</p>
                      <div className="flex flex-col">
                          <span className="font-black">₹{Number(order.totalAmount).toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                        </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Date</p>
                      <p className="font-bold text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderActions({ orderId }: { orderId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <Link href={`/admin/orders/${orderId}`}>
          <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
              <Eye className="h-3 w-3 mr-2" /> View Details
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          <Truck className="h-3 w-3 mr-2" /> Mark as Shipped
        </DropdownMenuItem>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          <CheckCircle className="h-3 w-3 mr-2" /> Mark as Delivered
        </DropdownMenuItem>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer text-destructive">
          <XCircle className="h-3 w-3 mr-2" /> Cancel Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
