"use client";

import { useAppStore } from "@/components/ui/app-provider";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/constants/type";
import { formatCurrency } from "@/lib/utils";
import { useGuestGetOrderListQuery } from "@/queries/useGuest";
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import DishReviewDialog from "./dish-review-dialog";
import { toast } from "sonner";
import QrPaymentDialog from "./qr-payment-dialog";
import { useTranslations } from "next-intl";

export default function OrderCart() {
  const t = useTranslations("GuestOrders");
  const { data, refetch } = useGuestGetOrderListQuery();
  const orders = useMemo(() => data?.payload.data ?? [], [data]);
  const socket = useAppStore((state) => state.socket);
  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price:
                result.waitingForPaying.price +
                order.dishSnapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity,
            },
          };
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity,
            },
          };
        }
        return result;
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      },
    );
  }, [orders]);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }
    // sử dụng function có thể sử dụng trước khi khai báo kiểu hosting của function
    //  nếu khai báo kiểu const thì phải khai báo kiểu around func và đưa lên trước khi sử dụng
    function onConnect() {
      console.log(socket?.id);
    }

    socket?.on("update-order", onUpdateOrder);

    function onDisconnect() {
      console.log("disconnect");
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      const {
        dishSnapshot: { name },
        quantity,
      } = data;
      toast(t("updateOrderToast"), {
        description: t("updateOrderDescription", {
          name,
          quantity,
          status: t(`status.${data.status}`),
        }),
      });
      refetch();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      const { guest } = data[0];
      toast(t("paymentToast"), {
        description: t("paymentDescription", {
          name: guest?.name,
          tableNumber: guest?.tableNumber,
          count: data.length,
        }),
      });
      refetch();
    }

    socket?.on("update-order", onUpdateOrder);
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("payment", onPayment);
    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("payment", onPayment);
    };
  }, [refetch, socket, t]);
  
  return (
    <>
      <div className="space-y-4 pb-48">
      {orders.length === 0 && (
        <div className="col-span-full py-20 text-center text-muted-foreground font-body">
          {t("noOrders")}
        </div>
      )}
      {orders.map((order, index) => (
        <div key={order.id} className="flex gap-4 glass-card p-4 rounded-2xl items-center">
          <div className="text-sm font-semibold text-muted-foreground w-6 text-center">{index + 1}</div>
          <div className="flex-shrink-0 relative">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={100}
              className="object-cover w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-xl shadow-md"
            />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground font-body line-clamp-2">{order.dishSnapshot.name}</h3>
            <div className="text-sm font-semibold text-muted-foreground">
              {formatCurrency(order.dishSnapshot.price)} x {""}
              <Badge className="px-2 py-0.5 ml-1 bg-secondary text-secondary-foreground">{order.quantity}</Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex flex-col gap-2 justify-center items-end">
            <Badge variant="outline" className="border-secondary text-secondary font-medium">
              {t(`status.${order.status}`)}
            </Badge>
            {(order.status === OrderStatus.Paid ||
              order.status === OrderStatus.Delivered) &&
              order.dishSnapshot.dishId && (
                <DishReviewDialog
                  dishId={order.dishSnapshot.dishId}
                  dishName={order.dishSnapshot.name}
                />
              )}
          </div>
        </div>
      ))}
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-surface-container-high/80 backdrop-blur-xl p-4 sm:p-6 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto space-y-4">
          {paid.quantity !== 0 && (
            <div className="flex space-x-4 justify-between text-base sm:text-lg font-semibold text-muted-foreground">
              <span>{t("paidOrders", { count: paid.quantity })}</span>
              <span>{formatCurrency(paid.price)}</span>
            </div>
          )}
          <div className="flex space-x-4 justify-between text-lg sm:text-xl font-bold text-foreground">
            <span>{t("unpaidOrders", { count: waitingForPaying.quantity })}</span>
            <span className="text-secondary">{formatCurrency(waitingForPaying.price)}</span>
          </div>
          {waitingForPaying.quantity > 0 && (
            <QrPaymentDialog
              amount={waitingForPaying.price}
              onSuccess={() => refetch()}
            />
          )}
        </div>
      </div>
    </>
  );
}
