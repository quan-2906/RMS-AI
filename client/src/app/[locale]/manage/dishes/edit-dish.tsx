"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  UpdateDishBody,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { DishStatus, DishStatusValues } from "@/constants/type";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetDishQuery, useUpdateDishMutation } from "@/queries/useDish";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { getVietnameseDishStatus, handleErrorApi } from "@/lib/utils";
import revalidateApiRequest from "@/apiRequests/revalidate";
import { useTranslations } from "next-intl";

export default function EditDish({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const t = useTranslations("EditDish");
  const tAdd = useTranslations("AddDish");
  const tManage = useTranslations("ManageDishes");
  const tStatus = useTranslations("DishStatus");
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const updateDishMutation = useUpdateDishMutation();
  const uploadMediaMutation = useUploadMediaMutation();
  const { data } = useGetDishQuery({
    enabled: Boolean(id),
    id: id as number,
  });
  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody) as any,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: undefined,
      images360: [],
      status: DishStatus.Unavailable,
    },
  });
  const image = form.watch("image");
  const name = form.watch("name");

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  useEffect(() => {
    if (data) {
      const { name, image, description, price, status, images360 } = data.payload.data;
      form.reset({
        name,
        image: image ?? undefined,
        description,
        price,
        status,
        images360: (images360 as string[]) ?? [],
      });
    }
  }, [data, form]);

  const reset = () => {
    setId(undefined);
    setFile(null);
  };

  const onSubmit = async (values: UpdateDishBodyType) => {
    if (updateDishMutation.isPending) return;

    try {
      let body: UpdateDishBodyType & { id: number } = {
        id: id as number,
        ...values,
      };
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageResult.payload.data;
        body = {
          ...body,
          image: imageUrl,
        };
      }
      const result = await updateDishMutation.mutateAsync(body);
      await revalidateApiRequest("dishes");
      toast(tManage("success"), {
        description: result.payload.message,
      });
      reset();
      onSubmitSuccess && onSubmitSuccess();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };
  return (
    <AlertDialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-[600px] max-h-screen overflow-auto bg-surface-container border-border text-foreground rounded-2xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("requiredFields")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-dish-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">
                          {name || tAdd("imageLabel")}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange(
                              "http://localhost:3000/" + file.name,
                            );
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">{tAdd("upload")}</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">{tAdd("name")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{tAdd("price")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="price"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">{tAdd("description")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea
                          id="description"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">{tAdd("status")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={tAdd("selectStatus")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DishStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {tStatus(status)}
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

              <div className="grid grid-cols-4 items-start justify-items-start gap-4">
                <Label className="mt-2">Ảnh 360°</Label>
                <div className="col-span-3 w-full space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {form.watch("images360")?.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <img src={url} alt={`360-${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px]"
                          onClick={() => {
                            const current = form.getValues("images360") || [];
                            form.setValue("images360", current.filter((_, i) => i !== idx));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="flex aspect-square w-16 items-center justify-center rounded-md border border-dashed hover:bg-secondary/10 transition-colors"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = "image/*";
                        input.onchange = async (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) {
                            const newUrls: string[] = [];
                            for (let i = 0; i < files.length; i++) {
                              const formData = new FormData();
                              formData.append("file", files[i]);
                              const res = await uploadMediaMutation.mutateAsync(formData);
                              newUrls.push(res.payload.data);
                            }
                            const current = form.getValues("images360") || [];
                            form.setValue("images360", [...current, ...newUrls]);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Tải lên ít nhất 12 ảnh để có trải nghiệm 360 tốt nhất.</p>
                </div>
              </div>
            </div>
          </form>
        </Form>
        <AlertDialogFooter>
          <Button type="submit" form="edit-dish-form">
            {t("submit")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
