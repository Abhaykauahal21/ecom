"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, CreditCard, User, FileText, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAdminOrderById, updateOrderStatus } from "@/app/actions/order";
import InvoiceModal from "@/components/store/InvoiceModal";
import { toast } from "sonner";

interface AdminOrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailsPage({ params }: AdminOrderDetailsPageProps) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    async function loadAdminOrder() {
      try {
        setLoading(true);
        const res = await getAdminOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError(res.error || "Order not found");
        }
      } catch (err: any) {
        console.error("Failed to load admin order:", err);
        setError("Failed to fetch order details from the database.");
      } finally {
        setLoading(false);
      }
    }
    loadAdminOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-24">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fetching Order Details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center max-w-md mx-auto py-24 space-y-6">
        <div className="bg-red-500/10 text-red-500 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
          <Package className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight">Order Error</h1>
          <p className="text-sm text-muted-foreground">{error || "Failed to load the requested order."}</p>
        </div>
        <Link href="/admin/orders" className="block w-full">
          <Button className="w-full bg-black text-white hover:bg-black/90 font-bold">Back to Admin Orders</Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              Order Details
            </h1>
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                const res = await updateOrderStatus(order.id, newStatus as any);
                if (res.success) {
                  toast.success(`Order status updated to ${newStatus}`);
                  setOrder({ ...order, status: newStatus });
                } else {
                  toast.error(res.error || "Failed to update status");
                }
              } catch (err: any) {
                toast.error(err.message || "Something went wrong");
              }
            }}
            className="bg-background border border-muted font-bold text-xs uppercase rounded-lg px-3 h-10 outline-none cursor-pointer focus:border-brand"
          >
            <option value="PENDING">Pending (Placed)</option>
            <option value="CONFIRMED">Confirmed / Packed</option>
            <option value="SHIPPED">Shipped / Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button 
            onClick={() => setIsInvoiceOpen(true)}
            className="bg-black text-white hover:bg-black/90 font-black uppercase text-xs tracking-widest h-10 px-5 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Payment */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Package className="h-4 w-4" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.orderItems.map((item: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg border flex shrink-0 items-center justify-center overflow-hidden">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="object-cover h-full w-full" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{item.product.name}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-black text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Subtotal</span>
                <span className="font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Shipping</span>
                <span className="font-bold">{order.shippingCost === 0 ? "Free" : `₹${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-[11px] text-muted-foreground">
                <span className="font-bold uppercase text-[9px] tracking-widest">GST (18% Included)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-sm">Total Paid</span>
                <span className="font-black text-xl text-brand">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-lg flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-950 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800 dark:text-green-400 uppercase tracking-widest">Payment {order.paymentStatus || 'PAID'}</p>
                  {order.paymentId && (
                    <p className="text-[9px] text-green-600 dark:text-green-500 font-mono">ID: {order.paymentId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Name</p>
                <p className="font-bold text-sm text-black">{order.address.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Phone</p>
                <p className="font-bold text-sm">{order.address.phone}</p>
              </div>
              {order.user?.email && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Email</p>
                  <p className="font-bold text-sm break-all">{order.user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-1 text-sm font-medium text-muted-foreground">
              <p className="font-bold text-black">{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />
    </div>
  );
}
