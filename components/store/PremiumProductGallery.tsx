"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PremiumProductGalleryProps {
  images: string[];
}

export default function PremiumProductGallery({ images }: PremiumProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const galleryImages = images && images.length > 0 
    ? images 
    : ["https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=1200"]; // Default placeholder

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide pb-2 lg:pb-0">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              "relative h-20 w-20 lg:h-24 lg:w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300",
              currentImage === index 
                ? "border-brand ring-4 ring-brand/10 scale-95" 
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 group">
        <motion.div 
          className="relative aspect-square rounded-[2rem] overflow-hidden bg-muted cursor-zoom-in border border-white/10"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          layoutId="main-product-image"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Image
                src={galleryImages[currentImage]}
                alt="Product image"
                fill
                className={cn(
                  "object-cover transition-transform duration-200 ease-out",
                  isZoomed ? "scale-150" : "scale-100"
                )}
                style={
                  isZoomed
                    ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                    : undefined
                }
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-black shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-black shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Floating Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "h-1.5 transition-all duration-300 rounded-full",
                        currentImage === i ? "w-8 bg-brand" : "w-2 bg-white/40"
                    )} 
                />
            ))}
        </div>
      </div>
    </div>
  );
}
