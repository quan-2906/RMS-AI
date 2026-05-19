"use client";

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import AddOrder from "@/app/[locale]/manage/orders/add-order";
import EditOrder from "@/app/[locale]/manage/orders/edit-order";
import { createContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getVietnameseOrderStatus, handleErrorApi } from "@/lib/utils";
import { OrderStatusValues } from "@/constants/type";
import OrderStatics from "@/app/[locale]/manage/orders/order-statics";
import useOrderTableColumns from "@/app/[locale]/manage/orders/order-table-columns";
import { useOrderService } from "@/app/[locale]/manage/orders/order.service";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { endOfDay, format, startOfDay } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import AutoPagination from "@/components/ui/auto-pagination";
import {
  useGetOrderListQuery,
  useUpdateOrderMutation,
} from "@/queries/useOrderAdmin";
import { useTableListQuery } from "@/queries/useTable";
import { toast } from "sonner";
import { GuestCreateOrdersResType } from "@/schemaValidations/guest.schema";
import { useAppStore } from "@/components/ui/app-provider";
import { useTranslations } from "next-intl";

export const OrderTableContext = createContext({
  setOrderIdEdit: (value: number | undefined) => {},
  orderIdEdit: undefined as number | undefined,
  changeStatus: (payload: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID,
});

export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>;
export type Statics = {
  status: StatusCountObject;
  table: Record<number, Record<number, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<number, GetOrdersResType["data"]>;
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>;

const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function OrderTable() {
  const t = useTranslations("ManageOrders");
  const tStatus = useTranslations("OrderStatus");
  const socket = useAppStore((state) => state.socket);
  const searchParam = useSearchParams();
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1;
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>();
  const updateOrderMutation = useUpdateOrderMutation();

  const changeStatus = async (body: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const getOrderListQuery = useGetOrderListQuery({
    fromDate,
    toDate,
  });
  const refetchOrderList = getOrderListQuery.refetch;
  const orderList = getOrderListQuery.data?.payload.data ?? [];
  const tableListQuery = useTableListQuery();
  const tableList = tableListQuery.data?.payload.data ?? [];
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });
  const { statics, orderObjectByGuestId, servingGuestByTableNumber } =
    useOrderService(orderList);

  const columns = useOrderTableColumns(setOrderIdEdit, orderObjectByGuestId, changeStatus);

  const table = useReactTable({
    data: orderList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }
    // sử dụng function có thể sử dụng trước khi khai báo kiểu hosting của function
    //  nếu khai báo kiểu const thì phải khai báo kiểu around func và đưa lên trước khi sử dụng
    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnect");
    }

    function refetch() {
      const now = new Date();
      if (now >= fromDate && now <= toDate) {
        refetchOrderList();
      }
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      const {
        dishSnapshot: { name },
        quantity,
      } = data;
      toast(t("notifications.updateTitle"), {
        description: t("notifications.updateDesc", {
          name,
          quantity,
          status: tStatus(data.status),
        }),
      });
      refetch();
    }

    function onNewOrder(data: GuestCreateOrdersResType["data"]) {
      const { guest } = data[0];
      toast(t("notifications.newOrderTitle"), {
        description: t("notifications.newOrderDesc", {
          name: guest?.name ?? "",
          table: guest?.tableNumber ?? 0,
          count: data.length,
        }),
      });
      refetchOrderList();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      const { guest } = data[0];
      toast(t("notifications.paymentTitle"), {
        description: t("notifications.paymentDesc", {
          name: guest?.name ?? "",
          table: guest?.tableNumber ?? 0,
          count: data.length,
        }),
      });
      refetch();
    }

    socket?.on("update-order", onUpdateOrder);
    socket?.on("new-order", onNewOrder);
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("payment", onPayment);
    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("new-order", onNewOrder);
      socket?.off("payment", onPayment);
    };
  }, [refetchOrderList, fromDate, toDate, socket]);

  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId,
      }}
    >
      <div className="w-full space-y-6">
        <EditOrder
          id={orderIdEdit}
          setId={setOrderIdEdit}
          onSubmitSuccess={() => {}}
        />
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl w-full">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-body text-muted-foreground font-medium uppercase tracking-wider mb-1 sm:mb-0">{t("from")}</span>
              <Input
                type="datetime-local"
                placeholder={t("from")}
                className="text-sm bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary w-full sm:w-[190px]"
                value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-body text-muted-foreground font-medium uppercase tracking-wider mb-1 sm:mb-0">{t("to")}</span>
              <Input
                type="datetime-local"
                placeholder={t("to")}
                className="text-sm bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary w-full sm:w-[190px]"
                value={format(toDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button variant="outline" onClick={resetDateFilter} className="border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary rounded-lg px-6 font-body tracking-wider uppercase text-xs w-full sm:w-auto mt-2 sm:mt-0">
              {t("reset")}
            </Button>
          </div>
          <div className="w-full sm:w-auto">
            <AddOrder />
          </div>
        </div>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />
        
        <div className="glass-card rounded-2xl p-5 glow-hover transition-all">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mb-4">
            <Input
              placeholder={t("placeholderGuest")}
              value={
                (table.getColumn("guestName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("guestName")?.setFilterValue(event.target.value)
              }
              className="w-full sm:max-w-[150px] bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary"
            />
            <Input
              placeholder={t("placeholderTable")}
              value={
                (table.getColumn("tableNumber")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("tableNumber")?.setFilterValue(event.target.value)
              }
              className="w-full sm:max-w-[100px] bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary"
            />
            <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStatusFilter}
                  className="w-full sm:w-[150px] text-sm justify-between bg-surface-container-high border-border text-foreground hover:bg-white/5 hover:text-foreground rounded-lg focus-visible:ring-secondary"
                >
                  {table.getColumn("status")?.getFilterValue()
                    ? tStatus(
                        table
                          .getColumn("status")
                          ?.getFilterValue() as (typeof OrderStatusValues)[number],
                      )
                    : t("status")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 bg-surface-container border-border">
                <Command className="bg-transparent text-foreground">
                  <CommandGroup>
                    <CommandList>
                      {OrderStatusValues.map((status) => (
                        <CommandItem
                          key={status}
                          value={status}
                          className="hover:bg-white/5 aria-selected:bg-white/10"
                          onSelect={(currentValue) => {
                            table
                              .getColumn("status")
                              ?.setFilterValue(
                                currentValue ===
                                  table.getColumn("status")?.getFilterValue()
                                  ? ""
                                  : currentValue,
                              );
                            setOpenStatusFilter(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              table.getColumn("status")?.getFilterValue() ===
                                status
                                ? "opacity-100 text-secondary"
                                : "opacity-0",
                            )}
                          />
                          {tStatus(status)}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {/* <TableSkeleton /> */}
          <div className="rounded-xl border border-border overflow-hidden bg-background/50">
            <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2">
          <div className="text-xs text-muted-foreground font-body py-2 sm:py-0">
            {t("showing")}{" "}
            <strong className="text-foreground font-medium">{table.getPaginationRowModel().rows.length}</strong> {t("of")}{" "}
            <strong className="text-foreground font-medium">{orderList.length}</strong> {t("results")}
          </div>
            <div>
              <AutoPagination
                page={table.getState().pagination.pageIndex + 1}
                pageSize={table.getPageCount()}
                pathname="/manage/orders"
              />
            </div>
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  );
}
