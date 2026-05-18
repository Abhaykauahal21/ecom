"use client";

import { motion } from "framer-motion";
import { Star, ThumbsUp, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const reviews = [
  {
    id: 1,
    user: "Alex Johnson",
    rating: 5,
    date: "2 weeks ago",
    comment: "The mixability is incredible. No clumps at all even with a spoon. The chocolate flavor tastes like a premium milkshake without the guilt.",
    helpful: 24,
    verified: true,
    avatar: "AJ"
  },
  {
    id: 2,
    user: "Sarah Chen",
    rating: 5,
    date: "1 month ago",
    comment: "I've tried dozens of isolates, but this one is the easiest on my stomach. Noticed better recovery times within the first week.",
    helpful: 18,
    verified: true,
    avatar: "SC"
  },
  {
    id: 3,
    user: "Mike Ross",
    rating: 4,
    date: "1 month ago",
    comment: "Solid macros. A bit pricey but you definitely get what you pay for in terms of quality and taste.",
    helpful: 7,
    verified: true,
    avatar: "MR"
  }
];

export default function ProductReviews() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Athlete <span className="text-brand">Reviews</span></h2>
            <div className="flex items-center gap-6">
                <div className="text-6xl font-black">4.9</div>
                <div className="space-y-1">
                    <div className="flex text-brand">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                    </div>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Based on 1,240 reviews</p>
                </div>
            </div>
          </div>

          <div className="w-full md:max-w-xs space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4">
                    <span className="text-sm font-bold w-4">{star}</span>
                    <Progress value={star === 5 ? 85 : star === 4 ? 10 : 2} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground font-bold w-10">
                        {star === 5 ? "85%" : star === 4 ? "10%" : "2%"}
                    </span>
                </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
            <Button variant="outline" className="rounded-full font-bold uppercase text-xs">
                <Filter className="h-4 w-4 mr-2" /> Sort: Most Recent <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button className="md:ml-auto bg-foreground text-background hover:bg-brand hover:text-black rounded-full font-bold uppercase text-xs px-8">
                Write a Review
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted/30 p-8 rounded-[2rem] space-y-6 border border-white/5 hover:border-brand/20 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-brand/20">
                        <AvatarFallback className="font-bold bg-brand/10 text-brand">{review.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-sm">{review.user}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{review.date}</p>
                    </div>
                </div>
                {review.verified && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-none flex items-center gap-1 text-[10px] font-black uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                )}
              </div>

              <div className="flex text-brand">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "opacity-20"}`} />
                ))}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed italic">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-brand transition-colors">
                    <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-xs group">
                Load More Reviews <ChevronDown className="h-4 w-4 ml-2 group-hover:translate-y-1 transition-transform" />
            </Button>
        </div>
      </div>
    </section>
  );
}
