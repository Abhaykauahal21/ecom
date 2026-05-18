"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterOption {
    label: string;
    value: string;
}

interface ProductFiltersProps {
    categories: FilterOption[];
    brands: FilterOption[];
    activeCategory?: string;
    activeBrand?: string;
}

const GOALS = [
    { label: "Muscle Gain", value: "muscle-gain" },
    { label: "Fat Loss", value: "fat-loss" },
    { label: "Endurance", value: "endurance" },
    { label: "Recovery", value: "recovery" },
];

const RATINGS = [
    { label: "4.5 & Up", value: "4.5" },
    { label: "4.0 & Up", value: "4.0" },
    { label: "3.5 & Up", value: "3.5" },
];

export default function ProductFilters({ categories, brands, activeCategory, activeBrand }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterClick = (type: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Toggle logic: if already selected, remove it. Otherwise, set it.
    if (current.get(type) === value) {
      current.delete(type);
    } else {
      current.set(type, value);
    }
    
    router.push(`${pathname}?${current.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-10">
      {/* Category Filter */}
      <FilterGroup 
        title="Category" 
        paramKey="category"
        options={categories} 
        activeValue={activeCategory}
        onChange={handleFilterClick}
      />
      
      {/* Brand Filter */}
      <FilterGroup 
        title="Brand" 
        paramKey="brand"
        options={brands} 
        activeValue={activeBrand}
        onChange={handleFilterClick}
      />

      {/* Goal Filter */}
      <FilterGroup title="Training Goal" options={GOALS} />

      {/* Price Range */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Price Range</h3>
        <Slider defaultValue={[0, 10000]} max={10000} step={100} className="py-4" />
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span>₹0</span>
            <span>₹10,000+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <FilterGroup title="Rating" options={RATINGS} />

      {/* Availability */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Availability</h3>
        <div className="flex items-center space-x-3 group cursor-pointer">
            <Checkbox id="in-stock-only" className="h-5 w-5 rounded-md border-2" />
            <Label 
                htmlFor="in-stock-only"
                className="text-xs font-bold uppercase tracking-tight leading-none group-hover:text-brand transition-colors cursor-pointer"
            >
                In Stock Only
            </Label>
        </div>
      </div>

      <Separator className="bg-white/5" />

      <Button onClick={clearFilters} variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-brand">
        Clear All Filters
      </Button>
    </div>
  );
}

function FilterGroup({ 
  title, 
  paramKey,
  options, 
  activeValue,
  onChange 
}: { 
  title: string; 
  paramKey?: string;
  options: FilterOption[];
  activeValue?: string;
  onChange?: (key: string, value: string) => void;
}) {
    if (options.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
            <div className="space-y-3">
                {options.map((option) => {
                    const isActive = activeValue === option.value;
                    return (
                      <div 
                        key={option.value} 
                        className="flex items-center space-x-3 group cursor-pointer"
                        onClick={() => paramKey && onChange && onChange(paramKey, option.value)}
                      >
                          <Checkbox 
                            id={`${title}-${option.value}`} 
                            checked={isActive}
                            className="h-5 w-5 rounded-md border-2 pointer-events-none" 
                          />
                          <Label 
                              htmlFor={`${title}-${option.value}`}
                              className={`text-xs font-bold uppercase tracking-tight leading-none transition-colors cursor-pointer ${isActive ? 'text-brand' : 'group-hover:text-brand'}`}
                          >
                              {option.label}
                          </Label>
                      </div>
                    );
                })}
            </div>
        </div>
    );
}
