"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MapPin, Plus, CreditCard, ShieldCheck, ArrowLeft, Loader2, Tag, Sparkles, Check } from "lucide-react";
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
import { getShippingConfig } from "@/app/actions/settings";
import AuthRequiredModal from "@/components/store/AuthRequiredModal";
import { Input } from "@/components/ui/input";
import { getActiveSale } from "@/app/actions/sale";

export default function CheckoutPage() {
  const { user, isLoaded } = useUser();
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const [shippingCharge, setShippingCharge] = useState(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

  const [activeSale, setActiveSale] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    fetchAddresses();
    loadShippingConfig();
    fetchActiveSale();
  }, []);

  const fetchActiveSale = async () => {
    try {
      const res = await getActiveSale();
      if (res.success && res.sale) {
        setActiveSale(res.sale);
      }
    } catch (error) {
      console.error("Failed to fetch active sale:", error);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (activeSale) {
      const activeCode = activeSale.name.toUpperCase().replace(/\s+/g, "");
      if (code === activeCode) {
        setAppliedPromo(activeSale);
        setAppliedPromoCode(activeCode);
        setPromoError("");
        toast.success(`Promo code "${activeCode}" applied successfully!`);
        return;
      }
    }

    // Fallback "SUMMER"
    if (code === "SUMMER") {
      setAppliedPromo({
        name: "Summer Sale",
        discountPercent: 10,
      });
      setAppliedPromoCode("SUMMER");
      setPromoError("");
      toast.success('Promo code "SUMMER" applied successfully!');
      return;
    }

    setPromoError("Invalid promo code");
    toast.error("Invalid promo code entered");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setAppliedPromoCode(null);
    setPromoCode("");
    setPromoError("");
    toast.success("Promo code removed");
  };

  const loadShippingConfig = async () => {
    try {
      const res = await getShippingConfig();
      if (res.success && res.config) {
        setShippingCharge(res.config.shippingCharge);
        setFreeShippingThreshold(res.config.freeShippingThreshold);
      }
    } catch (error) {
      console.error("Failed to load shipping config in checkout:", error);
    }
  };

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

  if (!user) {
    return <AuthRequiredModal fallbackUrl="/cart" />;
  }

  if (cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedPromo ? Math.round(subtotal * (appliedPromo.discountPercent / 100)) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shipping = discountedSubtotal >= freeShippingThreshold ? 0 : shippingCharge;
  const total = discountedSubtotal + shipping;

  console.log("CHECKOUT_DEBUG:", {
    subtotal,
    freeShippingThreshold,
    shippingCharge,
    shipping,
    total,
    types: {
      subtotal: typeof subtotal,
      freeShippingThreshold: typeof freeShippingThreshold,
      shippingCharge: typeof shippingCharge,
      shipping: typeof shipping
    }
  });

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Creating your order...");

      // 1. Create order on the server
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          addressId: selectedAddress,
          totalAmount: total,
          promoCode: appliedPromoCode || undefined,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Initialize Razorpay (or dummy flow)
      if (orderData.razorpayOrderId.startsWith("dummy_")) {
        setLoadingMessage("Processing payment details...");
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.id,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `dummy_payment_${Date.now()}`,
            razorpaySignature: "DUMMY_SIGNATURE",
          }),
        });

        if (verifyResponse.ok) {
          setLoadingMessage("Payment verified! Redirecting to tracking page...");
          cart.clearCart();
          window.location.href = `/orders/${orderData.id}?placed=true`;
          return;
        } else {
          toast.error("Dummy payment verification failed");
          setLoadingMessage(null);
          setIsLoading(false);
        }
      } else {
        setLoadingMessage("Redirecting to secure payment gateway...");
        // Real Razorpay flow
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "KAVYA BOSS NUTRITION",
          description: "Payment for your order",
          order_id: orderData.razorpayOrderId,
          handler: async function (response: any) {
            setLoadingMessage("Verifying your payment, please do not close this window...");
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
              setLoadingMessage("Payment successful! Loading your order details...");
              cart.clearCart();
              window.location.href = `/orders/${orderData.id}?placed=true`;
            } else {
              toast.error("Payment verification failed");
              setLoadingMessage(null);
              setIsLoading(false);
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
        setLoadingMessage(null);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Something went wrong");
      setLoadingMessage(null);
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

              {/* Promo Code Input */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Promo Code / Coupon</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code (e.g. SUMMER)"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    disabled={!!appliedPromo}
                    className="bg-background border-zinc-200 focus:border-brand rounded-xl text-foreground placeholder:text-muted-foreground"
                  />
                  {appliedPromo ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemovePromo}
                      className="border-zinc-200 text-red-500 hover:bg-zinc-100 font-bold uppercase text-xs tracking-wider px-4 rounded-xl"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      className="bg-black text-white hover:bg-zinc-800 font-bold uppercase text-xs tracking-wider px-4 rounded-xl border border-black"
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {promoError && <p className="text-xs text-red-500 font-semibold">{promoError}</p>}
                
                {/* Applied Promo Display */}
                {appliedPromo && appliedPromoCode && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="bg-green-500/20 p-1.5 rounded-lg">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                        Code "{appliedPromoCode}" Applied
                      </p>
                      <p className="text-[10px] text-green-600 dark:text-green-500 font-semibold">
                        You saved {appliedPromo.discountPercent}%!
                      </p>
                    </div>
                  </div>
                )}

                {/* Available Coupons list */}
                {!appliedPromo && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available Coupons</p>
                    
                    {/* Active DB Sale Coupon */}
                    {activeSale && (
                      <div 
                        onClick={() => {
                          const code = activeSale.name.toUpperCase().replace(/\s+/g, "");
                          setPromoCode(code);
                          setAppliedPromo(activeSale);
                          setAppliedPromoCode(code);
                          setPromoError("");
                          toast.success(`Promo code "${code}" applied!`);
                        }}
                        className="group flex items-center justify-between p-3 bg-brand/5 hover:bg-brand/10 border border-brand/20 hover:border-brand/40 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-brand/10 group-hover:bg-brand/20 p-2 rounded-lg transition-colors">
                            <Sparkles className="h-4 w-4 text-brand" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs uppercase bg-brand/20 text-brand px-2 py-0.5 rounded border border-brand/30">
                                {activeSale.name.toUpperCase().replace(/\s+/g, "")}
                              </span>
                              <span className="text-[10px] font-black text-brand uppercase tracking-wider">Save {activeSale.discountPercent}%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{activeSale.announcementText}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-brand group-hover:translate-x-0.5 transition-transform">Apply</span>
                      </div>
                    )}

                    {/* Default SUMMER Coupon */}
                    {(!activeSale || activeSale.name.toUpperCase().replace(/\s+/g, "") !== "SUMMER") && (
                      <div 
                        onClick={() => {
                          setPromoCode("SUMMER");
                          setAppliedPromo({
                            name: "Summer Sale",
                            discountPercent: 10,
                          });
                          setAppliedPromoCode("SUMMER");
                          setPromoError("");
                          toast.success(`Promo code "SUMMER" applied!`);
                        }}
                        className="group flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 p-2 rounded-lg transition-colors">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                                SUMMER
                              </span>
                              <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Save 10%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Special flat 10% discount on summer store items</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform">Apply</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount ({appliedPromo.discountPercent}%)</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
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
      {loadingMessage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6 text-white transition-opacity duration-300">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/20 blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 text-brand animate-spin relative z-10" />
          </div>
          <div className="space-y-2 text-center relative z-10 px-4 max-w-sm">
            <h3 className="text-xl font-black uppercase tracking-widest text-brand">KAVYA BOSS NUTRITION</h3>
            <p className="text-sm font-bold text-muted-foreground animate-pulse leading-relaxed">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
