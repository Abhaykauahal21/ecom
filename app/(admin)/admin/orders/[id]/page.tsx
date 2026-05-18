import Link from "next/link";
import { ArrowLeft, Package, Truck, CreditCard, User, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration since database isn't fully wired for orders yet
const getOrderData = (id: string) => ({
  id,
  status: "SHIPPED",
  paymentStatus: "PAID",
  createdAt: "2026-05-12 14:30:00",
  customer: {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 98765 43210",
  },
  shippingAddress: {
    line1: "123 Fitness Ave",
    line2: "Block B, Apartment 405",
    city: "Agra",
    state: "Uttar Pradesh",
    pincode: "282001",
  },
  items: [
    { name: "Kavya Boss Whey Protein (2kg)", quantity: 1, price: 4200 },
    { name: "Creatine Monohydrate (250g)", quantity: 1, price: 898 },
  ],
  subtotal: 5098,
  shipping: 0,
  total: 5098,
});

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = getOrderData(params.id);

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
              Order {order.id}
            </h1>
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Badge className={`font-black uppercase text-[10px] tracking-widest ${
            order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-brand/10 text-brand'
            }`}>
                {order.status}
            </Badge>
            <Button className="bg-black text-white hover:bg-black/90 font-bold uppercase text-xs">
                Update Status
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
                {order.items.map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded-lg border flex shrink-0 items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-tight">{item.name}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-black">₹{(item.price * item.quantity).toLocaleString()}</p>
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
                    <span className="font-bold">₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Shipping</span>
                    <span className="font-bold">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="font-black uppercase tracking-widest text-sm">Total Paid</span>
                    <span className="font-black text-xl text-brand">₹{order.total.toLocaleString()}</span>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Payment Successful</p>
                        <p className="text-[10px] text-green-600 font-medium">Razorpay transaction ID: pay_123456</p>
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
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="font-bold">{order.customer.name}</p>
                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
              </div>
              <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest">View Profile</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Truck className="h-4 w-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1 text-sm">
                <p className="font-bold">{order.customer.name}</p>
                <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
                <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
                <Button variant="secondary" className="w-full font-bold uppercase tracking-widest text-xs">
                    <FileText className="h-4 w-4 mr-2" /> Print Invoice
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
