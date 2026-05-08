"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
}

export default function Dish360Viewer({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = clientX - startX.current;
    if (Math.abs(diff) > 10) {
      const step = diff > 0 ? -1 : 1;
      setCurrentIndex((prev) => (prev + step + images.length) % images.length);
      startX.current = clientX;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-square relative cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden rounded-xl bg-surface-container shadow-2xl border border-white/5 group"
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-75",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={src}
            alt={`Dish angle ${index}`}
            fill
            className="object-cover"
            draggable={false}
          />
        </div>
      ))}

      {/* Control Overlay */}
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] animate-pulse">
            Vuốt để xoay món ăn
          </span>
        </div>
        <div className="flex gap-1">
          {images.map((_, index) => (
            <div 
              key={index} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                index === currentIndex ? "w-4 bg-secondary" : "w-1 bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Visual Cue */}
      <div className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">
        360° View
      </div>
    </div>
  );
}
