"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface MobileFilterPillsProps {
  items: { label: string; value: string }[];
  selected?: string;
  onSelect?: (value: string) => void;
}

export default function MobileFilterPills({ items, selected, onSelect }: MobileFilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: string) => {
    if (onSelect) {
      onSelect(value);
      return;
    }

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === "all") {
      current.delete("category");
    } else {
      current.set("category", value);
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
      {items.map((item) => (
        <motion.button
          key={item.value}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect(item.value)}
          className={cn(
            "whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2",
            selected === item.value
              ? "bg-brand border-brand text-black shadow-[0_10px_20px_rgba(245,166,35,0.2)]"
              : "bg-muted/30 border-white/5 text-muted-foreground hover:border-white/20"
          )}
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  );
}
