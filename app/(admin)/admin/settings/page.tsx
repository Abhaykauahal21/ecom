"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  Truck, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Loader2, 
  Eye,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getShippingConfig, updateShippingConfig } from "@/app/actions/settings";
import { toast } from "sonner";

const PRESETS = [
  { name: "Free Shipping", charge: 0, threshold: 0, description: "No shipping fees on any order." },
  { name: "Standard Flat Rate", charge: 50, threshold: 1000, description: "Flat ₹50, free over ₹1,000." },
  { name: "Premium Delivery", charge: 99, threshold: 500, description: "Flat ₹99, free over ₹500." },
];

export default function AdminSettingsPage() {
  const [shippingCharge, setShippingCharge] = useState<number>(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const res = await getShippingConfig();
        if (res.success && res.config) {
          setShippingCharge(res.config.shippingCharge);
          setFreeShippingThreshold(res.config.freeShippingThreshold);
        } else {
          toast.error("Failed to load settings. Using defaults.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred loading settings.");
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleApplyPreset = (charge: number, threshold: number) => {
    setShippingCharge(charge);
    setFreeShippingThreshold(threshold);
    toast.success("Preset applied to form! (Click Save Changes to apply permanently)");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingCharge < 0 || freeShippingThreshold < 0) {
      toast.error("Values cannot be negative.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateShippingConfig({
        shippingCharge,
        freeShippingThreshold,
      });

      if (res.success) {
        toast.success("Shipping configuration updated successfully!");
      } else {
        toast.error(res.error || "Failed to update configuration.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-12 w-12 text-brand animate-spin" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-brand" />
          Store Settings
        </h1>
        <p className="text-muted-foreground">Manage global storefront configurations and checkout rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave}>
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-muted/20 border-b pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-5 w-5 text-brand" /> Shipping Cost Settings
                </CardTitle>
                <CardDescription>
                  Configure how shipping fees are calculated during client checkout.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Shipping Charge Input */}
                  <div className="space-y-2">
                    <Label htmlFor="shippingCharge" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Standard Shipping Charge
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground font-black text-sm">₹</span>
                      </div>
                      <Input
                        id="shippingCharge"
                        type="number"
                        min="0"
                        step="any"
                        value={shippingCharge}
                        onChange={(e) => setShippingCharge(Number(e.target.value))}
                        className="pl-8 h-12 font-bold"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Charged on orders that do not qualify for free shipping.
                    </p>
                  </div>

                  {/* Free Shipping Threshold Input */}
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Free Shipping Threshold
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground font-black text-sm">₹</span>
                      </div>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        min="0"
                        step="any"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                        className="pl-8 h-12 font-bold"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Subtotal amount required to get free shipping. (Set to 0 for free shipping on all orders).
                    </p>
                  </div>

                </div>

                <Separator />

                {/* Presets Quick Select */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">
                    Quick Preset Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRESETS.map((preset) => {
                      const isMatching = shippingCharge === preset.charge && freeShippingThreshold === preset.threshold;
                      return (
                        <div 
                          key={preset.name}
                          onClick={() => handleApplyPreset(preset.charge, preset.threshold)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isMatching 
                              ? "bg-brand/5 border-brand text-foreground shadow-sm" 
                              : "bg-background border-muted hover:border-muted-foreground/30 hover:bg-muted/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-xs uppercase leading-none">{preset.name}</span>
                            {isMatching && <Check className="h-4 w-4 text-brand" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal mb-2">{preset.description}</p>
                          <div className="flex justify-between items-center text-xs font-bold mt-2">
                            <span>₹{preset.charge} Charge</span>
                            <span>₹{preset.threshold} Free</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="h-12 bg-brand text-black hover:bg-brand/90 font-black text-xs uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(0,255,135,0.2)] disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-md bg-muted/30 sticky top-24 overflow-hidden">
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" /> Live Store Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Dynamic Customer Announcement Preview */}
              <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand leading-none">Store Announcement Banner</p>
                <p className="text-sm font-bold leading-normal">
                  {freeShippingThreshold === 0 ? (
                    "🎉 FREE SHIPPING ON ALL ORDERS TODAY!"
                  ) : (
                    `⚡ GET FREE SHIPPING ON ORDERS ABOVE ₹${freeShippingThreshold.toLocaleString()}!`
                  )}
                </p>
              </div>

              {/* Dynamic Cart Calculation Preview */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Checkout Summary Preview</p>
                
                {/* Scenario 1: Below Threshold */}
                {freeShippingThreshold > 0 && (
                  <div className="p-4 rounded-xl border bg-background space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Order Under Threshold</span>
                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">Below Limit</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Items Subtotal</span>
                        <span>₹{(freeShippingThreshold - 1).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-foreground">
                        <span className="flex items-center gap-1">Shipping Fee</span>
                        <span>₹{shippingCharge}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-black">
                        <span>Total Pay</span>
                        <span className="text-brand">₹{(freeShippingThreshold - 1 + shippingCharge).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scenario 2: At/Above Threshold */}
                <div className="p-4 rounded-xl border bg-background space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Order Above Threshold</span>
                    <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Eligible for Free</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Items Subtotal</span>
                      <span>₹{freeShippingThreshold === 0 ? "599" : freeShippingThreshold.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-green-500">
                      <span>Shipping Fee</span>
                      <span>FREE</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-black">
                      <span>Total Pay</span>
                      <span className="text-brand">₹{freeShippingThreshold === 0 ? "599" : freeShippingThreshold.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Note */}
              <div className="p-3 bg-muted/40 rounded-lg flex gap-3 items-start">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Calculations here update instantly to let you preview settings. Customer cart and checkout screens will reflect these values immediately after saving.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
