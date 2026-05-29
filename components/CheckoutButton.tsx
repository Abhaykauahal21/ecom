"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface CheckoutButtonProps {
  cartItems: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  selectedAddressId: string;
  totalAmount: number;
  promoCode?: string | null;
  paymentMethod: "ONLINE" | "COD";
  onSuccess?: (orderId: string) => void;
  onFailure?: (errorMsg: string) => void;
  disabled?: boolean;
}

export default function CheckoutButton({
  cartItems,
  selectedAddressId,
  totalAmount,
  promoCode = null,
  paymentMethod = "ONLINE",
  onSuccess,
  onFailure,
  disabled = false,
}: CheckoutButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address first");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("Creating order...");

      // 1. Create order on backend (validate pricing & stock)
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          addressId: selectedAddressId,
          totalAmount,
          promoCode: promoCode || undefined,
          paymentMethod,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { id: orderId, paymentMethod: respMethod } = orderData;

      // 2. Handle COD — order already confirmed on backend
      if (respMethod === "COD" || paymentMethod === "COD") {
        toast.success("Order placed successfully! Pay on delivery.");
        if (onSuccess) {
          onSuccess(orderId);
        } else {
          window.location.href = `/orders/${orderId}?placed=true`;
        }
        return;
      }

      const { razorpayOrderId, amount, keyId } = orderData;

      // 3. Check if we should use dummy flow (e.g., in test mode without setup)
      if (razorpayOrderId.startsWith("dummy_")) {
        setLoadingMessage("Processing payment details...");
        
        // Simulating artificial delay for premium feel loading states
        await new Promise((resolve) => setTimeout(resolve, 800));

        setLoadingMessage("Verifying payment...");
        const verifyResponse = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpayOrderId,
            razorpayPaymentId: `dummy_pay_${Date.now()}`,
            razorpaySignature: "DUMMY_SIGNATURE",
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          toast.success("Payment successful!");
          if (onSuccess) {
            onSuccess(orderId);
          } else {
            window.location.href = `/orders/${orderId}?placed=true`;
          }
        } else {
          throw new Error(verifyData.error || "Verification failed");
        }
        return;
      }

      // 3. Launch Real Razorpay checkout popup
      setLoadingMessage("Opening secure payment window...");

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "E-Commerce Store",
        description: `Order Payment (#${orderId.substring(orderId.length - 8).toUpperCase()})`,
        order_id: razorpayOrderId,
        handler: async function (paymentResponse: any) {
          try {
            setIsLoading(true);
            setLoadingMessage("Verifying payment transaction...");

            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success("Payment verified successfully!");
              if (onSuccess) {
                onSuccess(orderId);
              } else {
                window.location.href = `/orders/${orderId}?placed=true`;
              }
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Payment verification failed");
            if (onFailure) onFailure(err.message || "Verification failed");
            window.location.href = `/checkout/failed?orderId=${orderId}`;
          } finally {
            setIsLoading(false);
            setLoadingMessage(null);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setLoadingMessage(null);
            toast.warning("Payment cancelled by user");
            if (onFailure) onFailure("Payment cancelled");
          },
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#00FF87", // Vibrant, modern theme color matching site style
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("[CHECKOUT_SUBMIT_ERROR]", error);
      toast.error(error.message || "Checkout failed. Please try again.");
      if (onFailure) onFailure(error.message || "Checkout failed");
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading || cartItems.length === 0}
        className="w-full h-14 bg-brand text-black hover:bg-brand/90 font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,135,0.3)] disabled:opacity-50 disabled:shadow-none cursor-pointer rounded-2xl flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {loadingMessage || "Processing..."}
          </span>
        ) : paymentMethod === "COD" ? (
          `Place Order • ₹${totalAmount.toLocaleString()}`
        ) : (
          `Pay ₹${totalAmount.toLocaleString()}`
        )}
      </Button>

      {isLoading && loadingMessage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6 text-white animate-in fade-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/20 blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 text-brand animate-spin relative z-10" />
          </div>
          <div className="space-y-2 text-center relative z-10 px-4 max-w-sm">
            <h3 className="text-xl font-black uppercase tracking-widest text-brand">Secure Checkout</h3>
            <p className="text-sm font-bold text-muted-foreground animate-pulse leading-relaxed">
              {loadingMessage}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-4">
              <ShieldCheck className="h-3 w-3 text-brand" />
              100% Encrypted Payment
            </div>
          </div>
        </div>
      )}
    </>
  );
}
