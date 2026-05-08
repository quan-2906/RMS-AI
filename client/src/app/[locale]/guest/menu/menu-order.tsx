"use client";

import { Button } from "@/components/ui/button";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import { useDishListQuery } from "@/queries/useDish";
import Image from "next/image";
import Quantity from "./quantity";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { useRouter } from "@/i18n/navigation";
import { DishStatus } from "@/constants/type";
import { ReceiptText, Rotate3d } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Dish360Viewer from "@/components/dish-360-viewer";

export default function MenuOrder() {
  const t = useTranslations("GuestMenu");
  const CATEGORIES = [
    { key: "all", label: t("all") },
    { key: "appetizer", label: t("appetizer") },
    { key: "mainCourse", label: t("mainCourse") },
    { key: "drink", label: t("drink") },
    { key: "dessert", label: t("dessert") },
  ];

  const { data } = useDishListQuery();
  const dishes = useMemo(() => {
    const result = data?.payload.data ?? [];
    console.log("Dishes data:", result);
    return result;
  }, [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const { mutateAsync } = useGuestOrderMutation();
  const router = useRouter();

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id);
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);

  const totalItems = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.quantity, 0);
  }, [orders]);

  const getDishCategory = (dishName: string) => {
    const name = dishName.toLowerCase();
    if (name.includes("nước") || name.includes("trà") || name.includes("sinh tố") || name.includes("smoothie") || name.includes("cafe") || name.includes("cà phê") || name.includes("nước ép") || name.includes("bia") || name.includes("rượu")) return "drink";
    if (name.includes("salad") || name.includes("khoai tây") || name.includes("súp") || name.includes("gỏi")) return "appetizer";
    if (name.includes("bánh") || name.includes("kem") || name.includes("chè") || name.includes("pudding")) return "dessert";
    return "mainCourse"; 
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (dish.status === DishStatus.Hidden) return false;
      if (activeCategory === "all") return true;
      return getDishCategory(dish.name) === activeCategory;
    });
  }, [dishes, activeCategory]);

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      await mutateAsync(orders);
      router.push("/guest/orders");
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <>
      <nav className="w-full py-4 overflow-x-auto no-scrollbar flex gap-3 snap-x mb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "snap-start shrink-0 px-5 py-2 rounded-full font-body uppercase text-[11px] font-semibold transition-all tracking-widest",
              activeCategory === cat.key
                ? "bg-secondary text-secondary-foreground shadow-[0_2px_10px_rgba(212,175,55,0.2)]"
                : "glass-card text-foreground hover:bg-white/5 border border-transparent"
            )}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.length === 0 ? (
          <div className="col-span-full py-10 text-center text-muted-foreground font-body">
            {t("noDishes")}
          </div>
        ) : (
          filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className={cn(
                "glass-card rounded-xl p-3 flex gap-4 glow-hover transition-all cursor-pointer group",
                {
                  "pointer-events-none opacity-50": dish.status === DishStatus.Unavailable,
                }
              )}
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative bg-surface-container">
                {dish.status === DishStatus.Unavailable && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold z-10 text-white/80 bg-black/50">
                    {t("outOfStock")}
                  </span>
                )}
                {dish.image && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative w-full h-full cursor-zoom-in">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dish.images360 && (dish.images360 as string[]).length > 0 && (
                          <div className="absolute top-2 right-2 bg-secondary text-on-secondary px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tighter shadow-xl flex items-center gap-1 animate-bounce">
                            <Rotate3d className="w-3 h-3" />
                            360°
                          </div>
                        )}
                      </div>
                    </DialogTrigger>
                    {dish.images360 && (dish.images360 as string[]).length > 0 && (
                      <DialogContent className="glass-card border-white/10 sm:max-w-[480px] p-4">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-secondary text-xl">{dish.name} - 360° View</DialogTitle>
                        </DialogHeader>
                        <div className="mt-2">
                          <Dish360Viewer images={dish.images360 as string[]} />
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                

              </div>
              
              <div className="flex flex-col flex-1 justify-between py-1">
                <div>
                  <h3 className="font-serif text-[16px] text-foreground mb-1 line-clamp-2 leading-tight">
                    {dish.name}
                  </h3>
                  <p className="font-body text-[12px] text-muted-foreground line-clamp-2 leading-snug">
                    {dish.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-body text-secondary font-semibold text-sm">
                    {formatCurrency(dish.price)}
                  </span>
                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Quantity
                      onChange={(value) => handleQuantityChange(dish.id, value)}
                      value={
                        orders.find((order) => order.dishId === dish.id)?.quantity ?? 0
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-background via-background/90 to-transparent pb-8">
          <div className="max-w-md mx-auto relative">
            <div className="absolute -top-3 -right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center font-body text-[10px] font-bold shadow-lg z-10">
              {totalItems}
            </div>
            
            <button
              onClick={handleOrder}
              disabled={orders.length === 0}
              className="w-full glass-card !bg-[#201f1f] hover:!bg-[#2b2a2a] rounded-xl p-4 flex items-center justify-between glow-hover transition-all group"
            >
              <div className="flex flex-col items-start">
                <span className="font-body text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                  {t("total")}
                </span>
                <span className="font-serif text-secondary text-[20px] leading-none mt-1">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 rounded-lg group-hover:opacity-90 transition-opacity">
                <span className="font-body uppercase text-[11px] font-bold tracking-widest">
                  {t("orderButton", { count: totalItems })}
                </span>
                <ReceiptText className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
