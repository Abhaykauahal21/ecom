"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { addAddress } from "@/app/actions/address";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressFormProps {
  onSuccess?: (address: any) => void;
  defaultValues?: Partial<FormValues>;
}

export default function AddressForm({ onSuccess, defaultValues }: AddressFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      line1: defaultValues?.line1 || "",
      line2: defaultValues?.line2 || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      pincode: defaultValues?.pincode || "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      const result = await addAddress(values);

      if (result.success) {
        toast.success("Address added successfully");
        setOpen(false);
        reset();
        if (onSuccess) onSuccess(result.address);
      } else {
        toast.error(result.error || "Failed to add address");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs font-bold uppercase" />}>
        <Plus className="h-3 w-3 mr-1" /> Add New
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Add New Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Phone Number</Label>
              <Input id="phone" placeholder="9876543210" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="line1" className="text-xs font-bold uppercase tracking-widest">Address Line 1</Label>
            <Input id="line1" placeholder="House No, Building, Street" {...register("line1")} />
            {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2" className="text-xs font-bold uppercase tracking-widest">Address Line 2 (Optional)</Label>
            <Input id="line2" placeholder="Area, Landmark" {...register("line2")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest">City</Label>
              <Input id="city" placeholder="Mumbai" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-xs font-bold uppercase tracking-widest">State</Label>
              <Input id="state" placeholder="Maharashtra" {...register("state")} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-widest">Pincode</Label>
            <Input id="pincode" placeholder="400001" {...register("pincode")} />
            {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Address...
              </>
            ) : (
              "Save Address"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

