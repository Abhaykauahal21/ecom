import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sign Up | Kavya Boss Nutrition",
  description: "Create a new account at Kavya Boss Nutrition to track orders, save delivery addresses, and check out faster.",
};

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white hover:text-brand transition-colors text-glow">
              KAVYA BOSS <span className="text-brand">NUTRITION</span>
            </h1>
          </Link>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            Premium Supplements & Fitness Essentials
          </p>
        </div>

        {/* Clerk Component Wrapper */}
        <div className="w-full bg-zinc-950/80 border border-zinc-900 rounded-3xl p-1.5 shadow-2xl backdrop-blur-md flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-white font-black uppercase tracking-tight",
                headerSubtitle: "text-zinc-400 font-medium",
                socialButtonsBlockButton: "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800",
                socialButtonsBlockButtonText: "text-white font-bold",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500 font-bold uppercase text-[9px] tracking-wider",
                formFieldLabel: "text-zinc-400 font-black uppercase text-[9px] tracking-wider",
                formFieldInput: "bg-zinc-900/60 border-zinc-800 text-white focus:border-brand rounded-xl",
                formButtonPrimary: "bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest text-xs h-12 rounded-xl transition-all shadow-lg shadow-brand/10",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-brand hover:text-brand/90 font-bold",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-brand",
              }
            }}
          />
        </div>

        {/* Back Link */}
        <Link 
          href="/" 
          className="text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home Page
        </Link>
      </div>
    </div>
  );
}
