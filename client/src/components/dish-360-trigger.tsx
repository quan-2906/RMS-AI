"use client";

import { Rotate3d } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Dish360Viewer from "@/components/dish-360-viewer";
import { cn } from "@/lib/utils";

interface Dish360TriggerProps {
  dishName: string;
  images360: string[];
  className?: string;
  buttonClassName?: string;
  asBadge?: boolean;
}

export default function Dish360Trigger({ 
  dishName, 
  images360, 
  className,
  buttonClassName,
  asBadge = false
}: Dish360TriggerProps) {
  if (!images360 || images360.length === 0) return null;

  return (
    <div className={cn("z-20", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <button 
            className={cn(
              "bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest shadow-2xl flex items-center gap-2 animate-bounce hover:scale-105 active:scale-95 transition-all",
              asBadge ? "absolute top-3 right-3" : "px-4 py-2 text-xs",
              buttonClassName
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Rotate3d className={asBadge ? "w-4 h-4" : "w-5 h-5"} />
            XEM 360° {!asBadge && "ĐỘ"}
          </button>
        </DialogTrigger>
        <DialogContent 
          className="glass-card border-white/10 sm:max-w-[600px] p-4 md:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-secondary text-2xl">
              {dishName} - 360° Experience
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Dish360Viewer images={images360} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
