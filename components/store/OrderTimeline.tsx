import { Check, Truck, Package, ShoppingBag, Clock } from "lucide-react";

interface OrderTimelineProps {
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  updatedAt: Date;
}

const statusSteps = [
  { id: "PENDING", label: "Placed", icon: ShoppingBag },
  { id: "CONFIRMED", label: "Confirmed", icon: Check },
  { id: "PROCESSING", label: "Processing", icon: Clock },
  { id: "SHIPPED", label: "Shipped", icon: Truck },
  { id: "DELIVERED", label: "Delivered", icon: Package },
];

export default function OrderTimeline({ status, updatedAt }: OrderTimelineProps) {
  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);
  
  if (status === "CANCELLED") {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <span className="font-bold">This order has been cancelled.</span>
      </div>
    );
  }

  return (
    <div className="relative flex justify-between items-start w-full py-8">
      {/* Connector Line */}
      <div className="absolute top-[52px] left-0 w-full h-[2px] bg-muted -z-10" />
      <div 
        className="absolute top-[52px] left-0 h-[2px] bg-brand transition-all duration-500 -z-10" 
        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
      />

      {statusSteps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.id} className="flex flex-col items-center gap-3">
            <div 
              className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                isCompleted 
                  ? "bg-brand border-brand text-black" 
                  : "bg-background border-muted text-muted-foreground"
              } ${isCurrent ? "scale-125 shadow-[0_0_15px_rgba(0,255,135,0.5)]" : ""}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                isCompleted ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              {isCurrent && (
                <span className="text-[8px] text-muted-foreground mt-1 whitespace-nowrap">
                    {new Date(updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
