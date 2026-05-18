"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Trophy, Target, Activity, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Pure Protein Isolate",
    description: "25g of the highest quality cold-filtered whey isolate for maximum muscle protein synthesis.",
    icon: Zap,
    className: "lg:col-span-2 lg:row-span-2 bg-brand/5 border-brand/20",
    iconColor: "text-brand"
  },
  {
    title: "Lab Tested",
    description: "Third-party tested for purity and potency.",
    icon: ShieldCheck,
    className: "bg-blue-500/5 border-blue-500/20",
    iconColor: "text-blue-500"
  },
  {
    title: "Elite Recovery",
    description: "Accelerate repair and reduce soreness.",
    icon: Trophy,
    className: "bg-orange-500/5 border-orange-500/20",
    iconColor: "text-orange-500"
  },
  {
    title: "Zero Added Sugar",
    description: "Clean nutrition without the unnecessary calories.",
    icon: Target,
    className: "bg-purple-500/5 border-purple-500/20",
    iconColor: "text-purple-500"
  },
  {
    title: "Digestive Enzymes",
    description: "Enhanced absorption and no bloating.",
    icon: Activity,
    className: "bg-green-500/5 border-green-500/20",
    iconColor: "text-green-500"
  }
];

export default function ProductBento() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Engineered for <span className="text-brand">Performance</span></h2>
          <p className="text-muted-foreground">Every scoop is packed with scientifically-backed ingredients to push your limits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative group overflow-hidden p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                  feature.className
                )}
              >
                <div className={cn("p-3 rounded-2xl w-fit mb-6", feature.iconColor, "bg-current/10")}>
                    <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                
                {/* Decorative Gradient */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-current/5 blur-[80px] group-hover:bg-current/10 transition-colors rounded-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
