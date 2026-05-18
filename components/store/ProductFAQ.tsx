"use client";

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { MessageSquare } from "lucide-react";

const faqs = [
  {
    question: "When is the best time to take Elite Whey Isolate?",
    answer: "For maximum muscle recovery, we recommend consuming it within 30-45 minutes post-workout. However, it can also be used as a high-protein snack between meals to meet your daily protein requirements."
  },
  {
    question: "Is this product suitable for lactose-intolerant individuals?",
    answer: "Elite Whey Isolate is cold-filtered to remove most of the lactose and fat. While many people with mild lactose sensitivity tolerate it well, we recommend starting with a half-serving or consulting your doctor if you have severe lactose intolerance."
  },
  {
    question: "Can I stack this with other supplements?",
    answer: "Absolutely! It stacks perfectly with Creatine Monohydrate for strength and Pre-Workout for energy. Many athletes mix their Creatine directly into their post-workout protein shake."
  },
  {
    question: "How many servings are in the 2kg tub?",
    answer: "The 2kg tub contains approximately 60 servings based on a 33g scoop size."
  }
];

export default function ProductFAQ() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
            <div className="bg-brand/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-6 w-6 text-brand" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Common <span className="text-brand">Questions</span></h2>
            <p className="text-muted-foreground">Everything you need to know about our premium isolate.</p>
        </div>

        <Accordion className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-none bg-background rounded-3xl px-8 transition-all hover:shadow-lg"
            >
              <AccordionTrigger className="hover:no-underline py-8 text-left group">
                <span className="text-lg font-bold tracking-tight group-data-[state=active]:text-brand transition-colors">
                    {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-8 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
