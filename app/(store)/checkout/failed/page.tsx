"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertOctagon, HelpCircle, ArrowLeft, RefreshCw, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function FailedPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const errorMsg = searchParams.get("error") || "The payment transaction was cancelled or declined by your bank/payment provider.";

  return (
    <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-10">
        <div className="mx-auto h-24 w-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertOctagon className="h-14 w-14 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">Payment Failed</h1>
        <p className="text-muted-foreground text-sm">
          Something went wrong while processing your payment. Don't worry, if any money was deducted, it will be refunded by your bank.
        </p>
      </div>

      <Card className="border-none shadow-2xl bg-zinc-950/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Error Description
            </h3>
            <p className="text-sm font-semibold text-zinc-300 leading-relaxed">
              {errorMsg}
            </p>
          </div>

          {orderId && (
            <div className="flex justify-between items-center text-xs font-semibold bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-muted-foreground uppercase tracking-wider">Failed Order Reference</span>
              <span className="font-mono text-zinc-300 select-all">#{orderId.substring(orderId.length - 8).toUpperCase()}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link href="/checkout" className="block w-full">
              <Button className="w-full h-12 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" /> Retry Checkout
              </Button>
            </Link>
            <Link href="/cart" className="block w-full">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-white font-bold uppercase text-xs tracking-wider hover:bg-white/5 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Cart
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold pt-2">
            <HelpCircle className="h-3.5 w-3.5" /> Need Support? Contact Kavya Boss Nutrition
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-brand animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Page...</p>
      </div>
    }>
      <FailedPageContent />
    </Suspense>
  );
}
