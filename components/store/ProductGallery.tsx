"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentImage(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-xl">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 shadow-lg" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="relative flex-[0_0_100%] aspect-square min-w-0">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-contain p-6"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
        
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex h-10 w-10 border border-gray-100"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex h-10 w-10 border border-gray-100"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-md md:hidden">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentImage === index ? "w-6 bg-brand" : "w-1.5 bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-500 ${
                currentImage === index ? "border-brand bg-white shadow-md scale-105" : "border-gray-100 opacity-50 hover:opacity-100 hover:border-gray-200"
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
