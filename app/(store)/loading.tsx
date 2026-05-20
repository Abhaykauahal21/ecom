import { Dumbbell } from "lucide-react";

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 px-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing neon brand glow */}
        <div className="absolute h-32 w-32 rounded-full bg-brand/10 blur-3xl animate-pulse" />
        
        {/* Spinning sleek track ring */}
        <div className="h-24 w-24 rounded-full border-[6px] border-white/5 border-t-brand animate-spin duration-700" />
        
        {/* Bouncing dumbbell icon inside */}
        <div className="absolute flex items-center justify-center bg-muted/50 h-14 w-14 rounded-2xl border border-white/5 shadow-inner">
          <Dumbbell className="h-7 w-7 text-brand animate-pulse" />
        </div>
      </div>
      
      {/* Brand & Loading Info */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-foreground">
          KAVYA BOSS <span className="text-brand">NUTRITION</span>
        </h2>
        <div className="flex items-center justify-center gap-2">
          {/* Custom dot loading animation */}
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce delay-100" />
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce delay-200" />
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce delay-300" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] ml-1">
            Loading elite experience
          </p>
        </div>
      </div>
    </div>
  );
}
