"use client";

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const nutritionData = [
  { label: "Calories", value: "120 kcal" },
  { label: "Protein", value: "25g", highlight: true },
  { label: "Total Fat", value: "1.5g" },
  { label: "Saturated Fat", value: "0.5g" },
  { label: "Total Carbohydrate", value: "2g" },
  { label: "Sugars", value: "0g" },
  { label: "BCAAs", value: "5.5g", highlight: true },
  { label: "L-Glutamine", value: "4g" },
];

export default function ProductNutrition() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Pure <span className="text-brand">Transparency</span></h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe in full disclosure. No proprietary blends, no hidden fillers. Just clean, effective ingredients at dosages that work.
            </p>
            
            <Accordion className="w-full space-y-4">
              <AccordionItem value="ingredients" className="border-none bg-background rounded-[1.5rem] px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                    <span className="text-lg font-bold uppercase tracking-tight">Full Ingredient List</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  Whey Protein Isolate (Milk), Cocoa Powder (Chocolate Flavor), Natural and Artificial Flavors, Sunflower Lecithin, Xanthan Gum, Sucralose, Digestive Enzyme Blend (Protease, Lactase).
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="usage" className="border-none bg-background rounded-[1.5rem] px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                    <span className="text-lg font-bold uppercase tracking-tight">How to Use</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  Mix one scoop with 250-300ml of cold water or milk. Shake well for 30 seconds. For best results, consume within 30 minutes post-workout or as a high-protein snack anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality" className="border-none bg-background rounded-[1.5rem] px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                    <span className="text-lg font-bold uppercase tracking-tight">Quality Assurance</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  Manufactured in a GMP-certified facility. Every batch is tested for heavy metals and banned substances. Safe for athletes at all levels.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-background p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[60px] rounded-full" />
            
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight">Nutrition Facts</h3>
                <Badge variant="outline" className="font-bold border-brand text-brand">Per Serving (33g)</Badge>
            </div>

            <div className="space-y-4">
              {nutritionData.map((item) => (
                <div key={item.label} className="group/item">
                  <div className="flex justify-between items-center py-2 transition-transform duration-300 group-hover/item:translate-x-2">
                    <span className={item.highlight ? "font-black text-foreground" : "text-muted-foreground font-medium"}>
                        {item.label}
                    </span>
                    <span className={item.highlight ? "font-black text-brand text-lg" : "font-bold"}>
                        {item.value}
                    </span>
                  </div>
                  <Separator className="opacity-20" />
                </div>
              ))}
            </div>

            <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                * Percent Daily Values are based on a 2,000 calorie diet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
