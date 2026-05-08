"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { Card } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useGuestLoginMutation } from "@/queries/useGuest";
import { useAppStore } from "@/components/ui/app-provider";
import { generateSocketInstace, handleErrorApi } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GuestLoginForm() {
  const t = useTranslations("GuestLogin");
  const tBrand = useTranslations("Brand");
  const setRole = useAppStore((state) => state.setRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const searchParams = useSearchParams();
  const params = useParams();
  const tableNumber = Number(params.number);
  const token = searchParams.get("token")!;
  const router = useRouter();
  const guestLoginMutation = useGuestLoginMutation();
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: token ?? "",
      tableNumber,
    },
  });

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  async function onSubmit(values: GuestLoginBodyType) {
    if (guestLoginMutation.isPending) return;

    try {
      const result = await guestLoginMutation.mutateAsync(values);
      setRole(result.payload.data.guest.role);
      setSocket(generateSocketInstace(result.payload.data.accessToken));
      router.push("/guest/menu");
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative bg-gradient-to-br from-background via-surface-container-lowest to-[#1a1510] overflow-hidden w-full">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo Header */}
        <header className="flex flex-col items-center mb-10 w-full text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-secondary text-[32px]">
              restaurant
            </span>
          </div>
          <h1 className="font-serif text-4xl text-secondary tracking-[0.1em] uppercase font-bold">
            {tBrand("title")}
          </h1>
        </header>

        {/* Login Card */}
        <Card className="glass-card rounded-xl p-8 w-full flex flex-col items-center shadow-2xl relative overflow-hidden border-white/10">
          {/* Inner subtle glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>

          <div className="text-center w-full mb-8">
            <h2 className="font-serif text-2xl text-white mb-2">
              {t("welcome")}
            </h2>
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full mt-2 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                table_restaurant
              </span>
              <p className="font-body text-secondary font-bold uppercase tracking-widest text-xs">
                {t("tableNumber", { number: tableNumber })}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              className="w-full flex flex-col gap-6"
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label
                      className="block font-label-caps text-[10px] text-neutral-400 mb-2 uppercase tracking-widest"
                      htmlFor="name"
                    >
                      {t("yourName")}
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                        person
                      </span>
                      <Input
                        id="name"
                        placeholder={t("namePlaceholder")}
                        className="w-full bg-white/5 border-white/10 rounded-lg py-6 pl-10 pr-4 text-white placeholder:text-neutral-600 focus:border-secondary transition-all"
                        {...field}
                      />
                    </div>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg py-7 flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(233,195,73,0.15)] active:scale-[0.98]"
                disabled={guestLoginMutation.isPending}
              >
                {guestLoginMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                <span>{t("submit")}</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Button>
            </form>
          </Form>
        </Card>

        {/* Footer Text */}
        <div className="mt-10 text-center flex flex-col items-center gap-2 opacity-40">
          <span className="material-symbols-outlined text-neutral-400">
            qr_code_scanner
          </span>
          <p className="font-body text-sm text-neutral-400">
            {t("footer")}
          </p>
        </div>
      </main>
    </div>
  );
}
