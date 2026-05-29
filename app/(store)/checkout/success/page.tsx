"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2, Calendar, MapPin, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/app/actions/order";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await getOrderById(orderId!);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Retrieving Payment Invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-10">
        <div className="mx-auto h-24 w-24 bg-brand/10 text-brand rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,135,0.2)]">
          <CheckCircle2 className="h-14 w-14 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">Payment Successful!</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Thank you for your purchase. Your transaction was completed successfully, and your order is now processing.
        </p>
      </div>

      <Card className="border-none shadow-2xl bg-zinc-950/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Order Reference</span>
              <span className="font-mono font-bold text-sm text-brand select-all">
                #{orderId?.substring(orderId.length - 8).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Payment Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-green-400">
                <Receipt className="h-3 w-3" /> Paid
              </span>
            </div>
          </div>

          {order && (
            <>
              {/* Product list */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-brand" /> Items Purchased
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded-lg border bg-zinc-900 border-white/5 overflow-hidden shrink-0">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="object-cover h-full w-full" />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white line-clamp-1 max-w-[220px]">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground font-semibold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Delivery Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> Delivery Address
                </h3>
                <div className="text-sm font-medium text-muted-foreground bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="font-bold text-white uppercase">{order.address.name}</p>
                  <p className="text-xs">Phone: {order.address.phone}</p>
                  <p className="text-xs mt-1.5 leading-relaxed">
                    {order.address.line1}, {order.address.line2 ? `${order.address.line2}, ` : ""}{order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Pricing breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{order.orderItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0).toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount Applied</span>
                    <span>-₹{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Cost</span>
                  <span>{order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}</span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-bold text-white">Total Amount Paid</span>
                  <span className="text-2xl font-black text-brand">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-white font-bold uppercase text-xs tracking-wider hover:bg-white/5">
                Continue Shopping
              </Button>
            </Link>
            <Link href={orderId ? `/orders/${orderId}` : "/orders"} className="w-full">
              <Button className="w-full h-12 rounded-2xl bg-brand text-black hover:bg-brand/95 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,135,0.25)]">
                Track Your Order <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Page...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
