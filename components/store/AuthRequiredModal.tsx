"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, ShieldAlert, LogIn, UserPlus, ArrowLeft } from "lucide-react";

interface AuthRequiredModalProps {
  fallbackUrl?: string;
}

export default function AuthRequiredModal({ fallbackUrl = "/" }: AuthRequiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignIn = () => {
    setIsOpen(false);
    // Redirect to sign-in page with return URL
    const redirectUrl = encodeURIComponent(pathname || fallbackUrl);
    router.push(`/sign-in?redirect_url=${redirectUrl}`);
  };

  const handleSignUp = () => {
    setIsOpen(false);
    // Redirect to sign-up page with return URL
    const redirectUrl = encodeURIComponent(pathname || fallbackUrl);
    router.push(`/sign-up?redirect_url=${redirectUrl}`);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      setIsOpen(false);
      // Redirect back to home/fallback if they cancel/close the modal
      router.push(fallbackUrl);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border border-zinc-800 bg-zinc-950/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-8 rounded-3xl text-center text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="space-y-4">
          <div className="mx-auto h-16 w-16 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center animate-pulse">
            <Lock className="h-7 w-7 text-brand" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center text-glow text-white">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-zinc-400 text-center px-2">
            You must be logged in to access this protected area. Sign in to your account or create a new one to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-3">
          <Button
            onClick={handleSignIn}
            className="w-full font-black uppercase text-xs tracking-widest h-13 bg-brand text-black hover:bg-brand/90 rounded-2xl shadow-xl shadow-brand/10 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Account
          </Button>

          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full font-black uppercase text-xs tracking-widest h-13 border-zinc-800 text-white hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <UserPlus className="h-4 w-4" />
            Create New Account
          </Button>
        </div>

        <button
          onClick={() => handleClose(false)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto mt-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Cancel & Go Back
        </button>
      </DialogContent>
    </Dialog>
  );
}
