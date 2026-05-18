"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MapPin, Plus, CreditCard, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useCart from "@/hooks/useCart";
import { toast } from "sonner";
import Link from "next/link";
import { getAddresses } from "@/app/actions/address";
import AddressForm from "@/components/store/AddressForm";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { user, isLoaded } = useUser();
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsFetchingAddresses(true);
      const data = await getAddresses();
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
        setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  const handleAddressAdded = (newAddress: any) => {
    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedAddress(newAddress.id);
  };

  if (!isMounted || !isLoaded) return null;

  if (cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 99;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // 1. Create order on the server
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          addressId: selectedAddress,
          totalAmount: total,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "SUPPSTORE",
        description: "Payment for your order",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify payment on the server
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            cart.clearCart();
            toast.success("Order placed successfully!");
            router.push(`/orders/${orderData.id}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#00FF87",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-brand mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                Shipping Address
               </h2>
              <AddressForm 
                onSuccess={handleAddressAdded} 
                defaultValues={{
                  name: user?.fullName || "",
                  email: user?.primaryEmailAddress?.emailAddress || ""
                }}
              />
            </div>

            {isFetchingAddresses ? (
              <div className="flex items-center justify-center p-12 bg-muted/30 rounded-2xl border-2 border-dashed border-white/5">
                <Loader2 className="h-8 w-8 text-brand animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-2xl border-2 border-dashed border-white/5 text-center space-y-4">
                <div className="bg-brand/10 p-4 rounded-full">
                  <MapPin className="h-8 w-8 text-brand" />
                </div>
                <div>
                  <p className="font-bold">No addresses found</p>
                  <p className="text-sm text-muted-foreground">Please add a shipping address to continue</p>
                </div>
                <AddressForm onSuccess={handleAddressAdded} />
              </div>
            ) : (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id}>
                    <RadioGroupItem
                      value={address.id}
                      id={address.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={address.id}
                      className="flex flex-col h-full p-4 bg-background border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-brand hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                          {address.isDefault ? "Default Address" : "Shipping Address"}
                        </span>
                      </div>
                      <p className="font-black text-sm uppercase">{address.name}</p>
                      <p className="text-xs font-bold text-muted-foreground mb-2">{address.phone}</p>
                      <p className="text-sm text-muted-foreground">{address.line1}</p>
                      {address.line2 && <p className="text-sm text-muted-foreground">{address.line2}</p>}
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </section>

          {/* Payment Method Section */}
          <section className={cn(
            "space-y-4 transition-opacity duration-500",
            addresses.length === 0 ? "opacity-30 pointer-events-none" : "opacity-100"
          )}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand" />
              Payment Method
            </h2>
            <Card className="border-2">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                        <p className="font-bold">Online Payment</p>
                        <p className="text-xs text-muted-foreground">Razorpay (Cards, UPI, Netbanking)</p>
                    </div>
                </CardContent>
            </Card>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-lg bg-muted/30">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tight">Order Details</h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                        <div className="relative h-12 w-12 rounded border bg-background overflow-hidden shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-black text-brand">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={isLoading || !selectedAddress || addresses.length === 0}
                className="w-full h-14 bg-brand text-black hover:bg-brand/90 font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,135,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${total.toLocaleString()}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <ShieldCheck className="h-3 w-3 text-brand" />
                100% Secure Transaction
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
