"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
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
import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DishListResType } from "@/schemaValidations/dish.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditDish from "./edit-dish";
import { Input } from "@/components/ui/input";
import AddDish from "./add-dish";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AutoPagination from "@/components/ui/auto-pagination";
import { useDeleteDishMutation, useDishListQuery } from "@/queries/useDish";
import {
  formatCurrency,
  getVietnameseDishStatus,
  handleErrorApi,
} from "@/lib/utils";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type DishItem = DishListResType["data"][0];

const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void;
  dishIdEdit: number | undefined;
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: DishItem | null) => {},
});

const useDishColumns = (
  setDishIdEdit: (value: number) => void,
  setDishDelete: (value: DishItem | null) => void,
): ColumnDef<DishItem>[] => {
  const t = useTranslations("ManageDishes");
  const tStatus = useTranslations("DishStatus");

  return [
    {
      accessorKey: "id",
      header: t("id"),
    },
    {
      accessorKey: "image",
      header: t("image"),
      cell: ({ row }) => (
        <div>
          <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
            <AvatarImage src={row.getValue("image")} />
            <AvatarFallback className="rounded-none">
              {row.original.name}
            </AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "price",
      header: t("price"),
      cell: ({ row }) => (
        <div className="capitalize">{formatCurrency(row.getValue("price"))}</div>
      ),
    },
    {
      accessorKey: "description",
      header: t("descriptionLabel"),
      cell: ({ row }) => (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(row.getValue("description")),
          }}
          className="whitespace-pre-line"
        />
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => <div>{tStatus(row.getValue("status") as any)}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: function Actions({ row }) {
        const openEditDish = () => {
          setDishIdEdit(row.original.id);
        };

        const openDeleteDish = () => {
          setDishDelete(row.original);
        };
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openEditDish}>
                {t("edit", { defaultValue: "Edit" })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openDeleteDish}>
                {t("delete", { defaultValue: "Delete" })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete,
}: {
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}) {
  const { mutateAsync } = useDeleteDishMutation();
  const t = useTranslations("DeleteDish");
  const deleteDish = async () => {
    if (dishDelete) {
      try {
        const result = await mutateAsync(dishDelete.id);
        setDishDelete(null);
        toast.success(result.payload.message);
      } catch (error) {
        handleErrorApi({
          error,
        });
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { name: dishDelete?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>{t("continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function DishTable() {
  const t = useTranslations("ManageDishes");
  const searchParam = useSearchParams();
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1;
  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null);
  const columns = useDishColumns(setDishIdEdit, setDishDelete);
  const dishListQuery = useDishListQuery();
  const data = dishListQuery.data?.payload.data ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data,
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

  return (
    <DishTableContext.Provider
      value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}
    >
      <div className="w-full space-y-6">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish
          dishDelete={dishDelete}
          setDishDelete={setDishDelete}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 glass-card p-4 sm:p-5 rounded-2xl">
          <Input
            placeholder={t("filterPlaceholder")}
            value={(table.getColumn("name") ?? table.getColumn(t("name")))?.getFilterValue() as string ?? ""}
            onChange={(event) =>
              (table.getColumn("name") ?? table.getColumn(t("name")))?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-sm bg-background border-border text-foreground rounded-lg focus-visible:ring-secondary"
          />
          <div className="w-full sm:w-auto flex items-center gap-2">
            <AddDish />
          </div>
        </div>
        <div className="rounded-xl border border-border overflow-hidden bg-background/50 glass-card">
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
            <strong className="text-foreground font-medium">{table.getPaginationRowModel().rows.length}</strong> {t("in")}{" "}
            <strong className="text-foreground font-medium">{data.length}</strong> {t("results")}
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  );
}
