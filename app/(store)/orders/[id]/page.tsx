"use client";

import { ArrowLeft, MapPin, Package, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import OrderTimeline from "@/components/store/OrderTimeline";

const MOCK_ORDER = {
  id: "ord_1",
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "SHIPPED" as const,
  totalAmount: 5098,
  paymentStatus: "PAID",
  paymentId: "pay_123456789",
  address: {
    line1: "123 Fitness Street",
    line2: "Apt 4B, Muscle Tower",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  items: [
    {
      id: "oi_1",
      name: "Elite Whey Isolate",
      price: 4999,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=400",
      flavor: "Rich Chocolate",
      size: "2kg"
    },
    {
        id: "oi_2",
        name: "Shipping",
        price: 99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400",
    }
  ]
};

export default function OrderDetailPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-brand mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Order Details</h1>
          <p className="text-muted-foreground font-medium">Order #{MOCK_ORDER.id.split('_')[1]} • Placed on {MOCK_ORDER.createdAt.toLocaleDateString()}</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 font-bold">
            <ExternalLink className="h-4 w-4" />
            Download Invoice
        </Button>
      </div>

      {/* Tracking Timeline */}
      <Card className="mb-12 border-none shadow-md overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <OrderTimeline status={MOCK_ORDER.status} updatedAt={MOCK_ORDER.updatedAt} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Order Items and Summary */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand" />
                Order Items
            </h2>
            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    {MOCK_ORDER.items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-center gap-4 p-4 sm:p-6">
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                                    <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base">{item.name}</h3>
                                    {item.flavor && (
                                        <p className="text-xs text-muted-foreground">{item.flavor} | {item.size}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                            {index < MOCK_ORDER.items.length - 1 && <Separator />}
                        </div>
                    ))}
                </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                Order Summary
            </h2>
            <Card className="border-none shadow-sm bg-muted/20">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Subtotal</span>
                        <span className="font-bold">₹{(MOCK_ORDER.totalAmount - 99).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Shipping</span>
                        <span className="font-bold">₹99</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold">Total Paid</span>
                        <span className="text-2xl font-black text-brand">₹{MOCK_ORDER.totalAmount.toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Side: Shipping and Payment Info */}
        <div className="lg:col-span-1 space-y-8">
            <section>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand" />
                    Delivery Address
                </h2>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <p className="font-bold">{MOCK_ORDER.address.line1}</p>
                        <p className="text-sm text-muted-foreground">{MOCK_ORDER.address.line2}</p>
                        <p className="text-sm text-muted-foreground">
                            {MOCK_ORDER.address.city}, {MOCK_ORDER.address.state} - {MOCK_ORDER.address.pincode}
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-brand" />
                    Payment Information
                </h2>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Status</p>
                            <Badge className="bg-green-500/10 text-green-500 font-black uppercase tracking-widest text-[10px]">
                                {MOCK_ORDER.paymentStatus}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Method</p>
                            <p className="text-sm font-bold">Razorpay Online Payment</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Transaction ID</p>
                            <p className="text-xs font-mono text-muted-foreground">{MOCK_ORDER.paymentId}</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Card className="bg-brand text-black border-none shadow-lg">
                <CardContent className="p-6">
                    <h3 className="font-black uppercase tracking-tight mb-2">Need Help?</h3>
                    <p className="text-sm font-medium mb-4">If you have any questions about your order, our support team is here to help 24/7.</p>
                    <Button variant="secondary" className="w-full bg-black text-white hover:bg-black/90 font-bold">
                        Contact Support
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
