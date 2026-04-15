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
            className="rounded-xl border bg-card h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (reviewableDishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <div className="rounded-full bg-muted p-5">
          <ClipboardList className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <p className="text-sm max-w-[260px] leading-relaxed">{t("noDishes")}</p>
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
