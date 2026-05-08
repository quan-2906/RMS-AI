"use client";

import { Rotate3d, MousePointer2 } from "lucide-react";
import Dish360Viewer from "./dish-360-viewer";
import { useState } from "react";
import Image from "next/image";

interface Dish360CardPreviewProps {
  images360: string[];
  defaultImage: string | null;
  dishName: string;
}

export default function Dish360CardPreview({ images360, defaultImage, dishName }: Dish360CardPreviewProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  if (!images360 || images360.length === 0) {
    return defaultImage ? (
      <Image
        src={defaultImage}
        fill
        alt={dishName}
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
    ) : null;
  }

  return (
    <div 
      className="relative w-full h-full group/preview"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {isInteracting ? (
        <div className="w-full h-full bg-surface-container">
          <Dish360Viewer images={images360} />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-2 pointer-events-none opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <MousePointer2 className="w-3 h-3" />
            DRAG TO ROTATE
          </div>
        </div>
      ) : (
        <>
          {defaultImage && (
            <Image
              src={defaultImage}
              fill
              alt={dishName}
              className="object-cover transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity backdrop-blur-[2px]">
            <div className="bg-secondary text-on-secondary px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl scale-90 group-hover/preview:scale-100 transition-transform">
              <Rotate3d className="w-5 h-5 animate-spin-slow" />
              <span className="text-xs font-bold tracking-widest">360° PREVIEW</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
