"use client";

import { Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_ORDERS = [
  {
    id: "ord_1",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    amount: 5098,
    status: "SHIPPED",
    paymentStatus: "PAID",
    date: "2026-05-12 14:30",
    items: 2
  },
  {
    id: "ord_2",
    customer: "Anjali Gupta",
    email: "anjali@example.com",
    amount: 1299,
    status: "PENDING",
    paymentStatus: "PAID",
    date: "2026-05-12 13:15",
    items: 1
  },
  {
    id: "ord_3",
    customer: "Vikram Singh",
    email: "vikram@example.com",
    amount: 2499,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    date: "2026-05-12 11:45",
    items: 1
  },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and fulfillment status.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Pending</TabsTrigger>
            <TabsTrigger value="processing" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Processing</TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-brand data-[state=active]:text-black">Shipped</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-10 h-10" />
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
                {MOCK_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.email}</span>
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
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">{order.paymentStatus}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">₹{order.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-medium">{order.date}</td>
                    <td className="px-6 py-4 text-right">
                      <OrderActions orderId={order.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-none">{order.customer}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{order.id}</p>
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
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">{order.paymentStatus}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total</p>
                    <div className="flex flex-col">
                        <span className="font-black">₹{order.amount.toLocaleString()}</span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                      </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Date</p>
                    <p className="font-bold text-xs">{order.date.split(" ")[0]}</p>
                  </div>
                </div>
              </div>
            ))}
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
