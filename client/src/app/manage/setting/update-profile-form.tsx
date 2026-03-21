"use client";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccountMe, useUpdateMeMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data, refetch } = useAccountMe();
  const updataMeMutation = useUpdateMeMutation();
  const uploadMediaMutation = useUploadMediaMutation();
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: undefined,
    },
  });

  const avatar = form.watch("avatar");
  const name = form.watch("name");

  useEffect(() => {
    if (data) {
      const { name, avatar } = data?.payload.data;
      form.reset({
        name,
        avatar: avatar ?? "",
      });
    }
  }, [form, data]);

  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [avatar, file]);

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updataMeMutation.isPending) return;
    try {
      let body = values;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageResult.payload.data;
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      const result = await updataMeMutation.mutateAsync(body);
      toast("Thành Công", {
        description: result.payload.message,
      });
      refetch();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset}
        onSubmit={form.handleSubmit(onSubmit, (err) => {
          console.warn(err);
        })}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className="rounded-none">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            // Fix: dùng createObjectURL để tạo URL hợp lệ
                            // Schema yêu cầu avatar phải là URL (z.string().url())
                            // file.name chỉ là "cat.jpg" → không phải URL → validation fail
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
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
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
