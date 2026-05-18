"use client";

import { ShoppingBag, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_ORDERS = [
  {
    id: "ord_1",
    createdAt: new Date(),
    status: "SHIPPED",
    totalAmount: 5098,
    itemsCount: 2,
    image: "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "ord_2",
    createdAt: new Date(Date.now() - 86400000 * 2),
    status: "DELIVERED",
    totalAmount: 1299,
    itemsCount: 1,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400",
  },
];

export default function OrdersPage() {
  if (MOCK_ORDERS.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-muted p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">No orders yet</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            When you place an order, it will appear here for you to track.
          </p>
          <Link href="/products">
            <Button className="bg-brand text-black hover:bg-brand/90 font-bold">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">My Orders</h1>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="hover:border-brand transition-all cursor-pointer group">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image src={order.image} alt="Order item" fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
                          Order #{order.id.split('_')[1]}
                        </p>
                        <h3 className="font-bold text-sm sm:text-base">
                          {order.itemsCount} {order.itemsCount === 1 ? "Item" : "Items"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Placed on {order.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`font-black uppercase tracking-tighter text-[10px] ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 
                          order.status === 'SHIPPED' ? 'bg-brand/10 text-brand' : ''
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="font-black text-lg">₹{order.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-brand mt-1 font-bold group-hover:gap-2 transition-all">
                      View Detail <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
