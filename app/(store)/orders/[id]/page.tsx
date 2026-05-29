"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, MapPin, Package, CreditCard, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import OrderTimeline from "@/components/store/OrderTimeline";
import { getOrderById } from "@/app/actions/order";
import InvoiceModal from "@/components/store/InvoiceModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import AuthRequiredModal from "@/components/store/AuthRequiredModal";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id: orderId } = use(params);
  const { isLoaded: authLoaded, isSignedIn } = useUser();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [showPlacedPopup, setShowPlacedPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("placed") === "true") {
        setShowPlacedPopup(true);
        // Clear url parameters without triggering refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, []);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError(res.error || "Order not found or unauthorized");
        }
      } catch (err: any) {
        console.error("Failed to load order:", err);
        setError("An unexpected error occurred while loading your order.");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (!authLoaded) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthRequiredModal fallbackUrl="/orders" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md space-y-6">
        <div className="bg-red-500/10 text-red-500 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
          <Package className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight">Order Error</h1>
          <p className="text-sm text-muted-foreground">{error || "This order does not exist or you don't have access to it."}</p>
        </div>
        <Link href="/orders" className="block w-full">
          <Button className="w-full bg-black text-white hover:bg-black/90 font-bold">Back to Orders Table</Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-brand mb-8 transition-colors text-xs font-bold uppercase tracking-widest">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Order Details</h1>
          <p className="text-muted-foreground font-medium text-[10px] sm:text-xs uppercase tracking-wider">
            Order #{order.id.substring(order.id.length - 8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button 
          onClick={() => setIsInvoiceOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest bg-brand text-black hover:bg-brand/90 shadow-[0_0_20px_rgba(0,255,135,0.25)] h-11 px-5 rounded-2xl"
        >
          <ExternalLink className="h-4 w-4" />
          Download Invoice
        </Button>
      </div>

      {/* Tracking Timeline */}
      <Card className="mb-12 border-none shadow-md overflow-hidden bg-muted/20">
        <CardContent className="p-6 md:p-10">
          <OrderTimeline status={order.status} updatedAt={order.updatedAt} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {/* Left Side: Order Items and Summary */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand" />
              Order Items
            </h2>
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-4 p-4 sm:p-6">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="object-cover h-full w-full" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted-foreground/10">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base leading-tight">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-bold">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                    {index < order.orderItems.length - 1 && <Separator />}
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
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      Discount{order.discountCode ? ` (Code: ${order.discountCode})` : ''}
                    </span>
                    <span className="font-bold text-green-600">-₹{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="font-bold">{order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-sm text-[11px] text-muted-foreground">
                  <span className="font-medium">GST (18% Included)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold">{order.paymentMethod === "COD" ? "Total Amount" : "Total Paid"}</span>
                  <span className="text-2xl font-black text-brand">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Side: Shipping and Payment Info */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              Delivery Address
            </h2>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-1 text-sm font-medium">
                <p className="font-bold text-base uppercase text-black">{order.address.name}</p>
                <p className="text-muted-foreground font-bold text-xs">Phone: {order.address.phone}</p>
                <Separator className="my-2" />
                <p className="text-muted-foreground">{order.address.line1}</p>
                {order.address.line2 && <p className="text-muted-foreground">{order.address.line2}</p>}
                <p className="text-muted-foreground font-bold">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
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
                  <Badge className={`font-black uppercase tracking-widest text-[10px] ${
                    order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' :
                    order.paymentStatus === 'UNPAID' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {order.paymentStatus === 'UNPAID' ? 'Pay on Delivery' : order.paymentStatus || 'PAID'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Method</p>
                  <p className="text-sm font-bold">
                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay Online Payment"}
                  </p>
                </div>
                {order.paymentId && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Transaction ID</p>
                    <p className="text-xs font-mono text-muted-foreground select-all bg-muted p-1.5 rounded">{order.paymentId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

      <Dialog open={showPlacedPopup} onOpenChange={setShowPlacedPopup}>
        <DialogContent className="w-[92vw] max-w-md border-none shadow-2xl bg-white dark:bg-black backdrop-blur-2xl p-4 sm:p-6 rounded-3xl text-center">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-green-100 dark:bg-green-950/50 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-center">
              ORDER PLACED!
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground text-center px-2">
              Thank you for shopping with <strong className="text-black dark:text-white font-bold">Kavya Boss Nutrition</strong>! Your order has been placed successfully and is currently being processed.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 sm:my-6 bg-muted/30 p-3 sm:p-4 rounded-2xl border border-muted/50 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Order ID</span>
              <span className="font-mono font-bold select-all">#{order.id.substring(order.id.length - 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">{order.paymentMethod === "COD" ? "Total Amount" : "Total Paid"}</span>
              <span className="font-black text-brand text-sm sm:text-base">₹{order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Address</span>
              <span className="font-bold text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">{order.address.name}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowPlacedPopup(false)}
            className="w-full font-black uppercase text-xs tracking-widest h-11 sm:h-12 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-2xl shadow-xl"
          >
            Track My Order
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
