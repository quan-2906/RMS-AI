"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";
import { useGuestGetOrderListQuery } from "@/queries/useGuest";
import { OrderStatus } from "@/constants/type";
import DishReviewCard from "./dish-review-card";

export default function ReviewList() {
  const t = useTranslations("GuestReview");
  const { data, isLoading } = useGuestGetOrderListQuery();
  const orders = useMemo(() => data?.payload.data ?? [], [data]);

  const reviewableDishes = useMemo(() => {
    const map = new Map<
      number,
      { dishId: number; dishName: string; dishImage: string; dishPrice: number }
    >();

    orders.forEach((order) => {
      const { dishSnapshot } = order;
      const isPaidOrDelivered =
        order.status === OrderStatus.Paid ||
        order.status === OrderStatus.Delivered;

      if (isPaidOrDelivered && dishSnapshot.dishId) {
        if (!map.has(dishSnapshot.dishId)) {
          map.set(dishSnapshot.dishId, {
            dishId: dishSnapshot.dishId,
            dishName: dishSnapshot.name,
            dishImage: dishSnapshot.image,
            dishPrice: dishSnapshot.price,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl h-44 animate-pulse opacity-50"
          />
        ))}
      </div>
    );
  }

  if (reviewableDishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground glass-card rounded-3xl mt-10 p-6 border border-border/30">
        <div className="rounded-full bg-secondary/10 p-5 shadow-[0_0_30px_rgba(212,175,55,0.15)] border border-secondary/20">
          <ClipboardList className="w-10 h-10 text-secondary" />
        </div>
        <p className="text-base font-medium max-w-[260px] leading-relaxed text-foreground/80">{t("noDishes")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewableDishes.map((dish) => (
        <DishReviewCard
          key={dish.dishId}
          dishId={dish.dishId}
          dishName={dish.dishName}
          dishImage={dish.dishImage}
          dishPrice={dish.dishPrice}
        />
      ))}
    </div>
  );
}
