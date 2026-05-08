import { Fragment, useState } from "react";
import { Users } from "lucide-react";
import { OrderStatusIcon, cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrderStatus, OrderStatusValues } from "@/constants/type";
import { TableListResType } from "@/schemaValidations/table.schema";
import { Badge } from "@/components/ui/badge";
import {
  ServingGuestByTableNumber,
  Statics,
  StatusCountObject,
} from "@/app/[locale]/manage/orders/order-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderGuestDetail from "@/app/[locale]/manage/orders/order-guest-detail";
import { Separator } from "@/components/ui/separator";

// Ví dụ:
// const statics: Statics = {
//   status: {
//     Pending: 1,
//     Processing: 2,
//     Delivered: 3,
//     Paid: 5,
//     Rejected: 0
//   },
//   table: {
//     1: { // Bàn số 1
//       20: { // Guest 20
//         Pending: 1,
//         Processing: 2,
//         Delivered: 3,
//         Paid: 5,
//         Rejected: 0
//       },
//       21: { // Guest 21
//         Pending: 1,
//         Processing: 2,
//         Delivered: 3,
//         Paid: 5,
//         Rejected: 0
//       }
//     }
//   }
// }
export default function OrderStatics({
  statics,
  tableList,
  servingGuestByTableNumber,
}: {
  statics: Statics;
  tableList: TableListResType["data"];
  servingGuestByTableNumber: ServingGuestByTableNumber;
}) {
  const t = useTranslations("ManageOrders");
  const tStatus = useTranslations("OrderStatus");
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(0);
  const selectedServingGuest = servingGuestByTableNumber[selectedTableNumber];
  return (
    <Fragment>
      <Dialog
        open={Boolean(selectedTableNumber)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableNumber(0);
          }
        }}
      >
        <DialogContent className="max-h-full overflow-auto">
          {selectedServingGuest && (
            <DialogHeader>
              <DialogTitle>
                {t("guestSittingAtTable")} {selectedTableNumber}
              </DialogTitle>
            </DialogHeader>
          )}
          <div>
            {selectedServingGuest &&
              Object.keys(selectedServingGuest).map((guestId, index) => {
                const orders = selectedServingGuest[Number(guestId)];
                return (
                  <div key={guestId}>
                    <OrderGuestDetail
                      guest={orders[0].guest}
                      orders={orders}
                      onPaySuccess={() => {
                        setSelectedTableNumber(0);
                      }}
                    />
                    {index !== Object.keys(selectedServingGuest).length - 1 && (
                      <Separator className="my-5" />
                    )}
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex justify-start items-stretch gap-4 flex-wrap py-4">
        {tableList.map((table) => {
          const tableNumber: number = table.number;
          const tableStatics: Record<number, StatusCountObject> | undefined =
            statics.table[tableNumber];
          let isEmptyTable = true;
          let countObject: StatusCountObject = {
            Pending: 0,
            Processing: 0,
            Delivered: 0,
            Paid: 0,
            Rejected: 0,
          };
          const servingGuestCount = Object.values(
            servingGuestByTableNumber[tableNumber] ?? [],
          ).length;
          if (tableStatics) {
            for (const guestId in tableStatics) {
              const guestStatics = tableStatics[Number(guestId)];
              if (
                [
                  guestStatics.Pending,
                  guestStatics.Processing,
                  guestStatics.Delivered,
                ].some((status) => status !== 0 && status !== undefined)
              ) {
                isEmptyTable = false;
              }
              countObject = {
                Pending: countObject.Pending + (guestStatics.Pending ?? 0),
                Processing:
                  countObject.Processing + (guestStatics.Processing ?? 0),
                Delivered:
                  countObject.Delivered + (guestStatics.Delivered ?? 0),
                Paid: countObject.Paid + (guestStatics.Paid ?? 0),
                Rejected: countObject.Rejected + (guestStatics.Rejected ?? 0),
              };
            }
          }
          return (
            <div
              key={tableNumber}
              className={cn(
                "text-sm flex items-stretch gap-3 p-3 rounded-xl transition-all cursor-pointer min-w-[120px]",
                isEmptyTable
                  ? "glass-card hover:bg-white/5 border-border"
                  : "bg-secondary text-secondary-foreground shadow-[0_0_15px_rgba(233,195,73,0.3)] hover:opacity-90 border-transparent",
              )}
              onClick={() => {
                if (!isEmptyTable) setSelectedTableNumber(tableNumber);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="font-semibold text-center text-lg">
                  {tableNumber}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{servingGuestCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("serving")}: {servingGuestCount} {t("guests")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator
                orientation="vertical"
                className={cn("flex-shrink-0 flex-grow h-auto mx-1", {
                  "bg-secondary-foreground/20": !isEmptyTable,
                  "bg-white/10": isEmptyTable,
                })}
              />
              {isEmptyTable && (
                <div className="flex justify-between items-center text-sm">
                  {t("ready")}
                </div>
              )}
              {!isEmptyTable && (
                <div className="flex flex-col gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Pending className="w-4 h-4" />
                          <span>{countObject[OrderStatus.Pending] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {tStatus(OrderStatus.Pending)}:{" "}
                        {countObject[OrderStatus.Pending] ?? 0} {t("items")}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Processing className="w-4 h-4" />
                          <span>
                            {countObject[OrderStatus.Processing] ?? 0}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {tStatus(OrderStatus.Processing)}:{" "}
                        {countObject[OrderStatus.Processing] ?? 0} {t("items")}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Delivered className="w-4 h-4" />
                          <span>{countObject[OrderStatus.Delivered] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {tStatus(OrderStatus.Delivered)}:{" "}
                        {countObject[OrderStatus.Delivered] ?? 0} {t("items")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-start items-center gap-3 flex-wrap pt-6 pb-2">
        {OrderStatusValues.map((status) => (
          <Badge 
            variant="outline" 
            key={status}
            className="bg-surface-container border-secondary/30 text-secondary hover:bg-secondary/10 px-3 py-1 font-body text-[11px] uppercase tracking-wider"
          >
            {tStatus(status)}: {statics.status[status] ?? 0}
          </Badge>
        ))}
      </div>
    </Fragment>
  );
}
