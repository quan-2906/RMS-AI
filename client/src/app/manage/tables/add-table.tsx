"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableStatus, TableStatusValues } from "@/constants/type";
import { getVietnameseTableStatus, handleErrorApi } from "@/lib/utils";
import { useAddTableMutation } from "@/queries/useTable";
import {
  CreateTableBody,
  CreateTableBodyType,
} from "@/schemaValidations/table.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { toast } from "sonner";

export default function AddTable() {
  const [open, setOpen] = useState(false);
  const addTableMutation = useAddTableMutation();
  const form = useForm<CreateTableBodyType>({
    resolver: zodResolver(CreateTableBody) as Resolver<CreateTableBodyType>,
    defaultValues: {
      number: 0,
      capacity: 2,
      status: TableStatus.Hidden,
    },
  });

  const reset = () => {
    form.reset();
  };

  const onSubmit = async (values: CreateTableBodyType) => {
    if (addTableMutation.isPending) return;

    try {
      const result = await addTableMutation.mutateAsync(values);
      toast("Thành công", {
        description: result.payload.message,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm bàn
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="sm:max-w-[600px] max-h-screen overflow-auto"
        onCloseAutoFocus={() => form.reset()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Thêm bàn</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-table-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e);
            })}
            onReset={reset}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Số hiệu bàn</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="number"
                          type="number"
                          className="w-full"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">Lượng khách cho phép</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="capacity"
                          className="w-full"
                          {...field}
                          type="number"
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">Trạng thái</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseTableStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <AlertDialogFooter>
          <Button type="submit" form="add-table-form">
            Thêm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
