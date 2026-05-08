"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/queries/useAuth";
import { generateSocketInstace, handleErrorApi } from "@/lib/utils";
import { useEffect } from "react";
import envConfig from "@/config";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";
import { useAppStore } from "@/components/ui/app-provider";
import { toast } from "sonner";
import SearchParamsLoader, {
  useSearchParamsLoader,
} from "@/components/ui/search-params-loader";
import { Link, useRouter } from "@/i18n/navigation";
import { isLoginErrorKey } from "@/schemaValidations/auth.schema";

const getOauthGoogleUrl = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};
const googleOauthUrl = getOauthGoogleUrl();

const SERVER_ERROR_MAP: Record<string, string> = {
  "Email hoặc mật khẩu không đúng": "invalidCredentials",
  "Email không tồn tại": "emailNotFound",
};
export default function LoginForm() {
  const t = useTranslations("Login");
  const errorMessageT = useTranslations("ErrorMessage");
  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const loginMutation = useLoginMutation();
  const clearTokens = searchParams?.get("clearTokens");
  const setSocket = useAppStore((state) => state.setSocket);
  const setRole = useAppStore((state) => state.setRole);
  const displayError = (message?: string) => {
    if (!message) return null;
    return isLoginErrorKey(message) ? errorMessageT(message as any) : message;
  };
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  useEffect(() => {
    if (clearTokens) {
      setRole();
    }
  }, [clearTokens, setRole]);
  const onSubmit = async (data: LoginBodyType) => {
    // Khi nhấn submit thì React hook form sẽ validate cái form bằng zod schema ở client trước
    // Nếu không pass qua vòng này thì sẽ không gọi api
    if (loginMutation.isPending) return;
    try {
      const result = await loginMutation.mutateAsync(data);
      toast("", {
        description: result.payload.message,
      });
      setRole(result.payload.data.account.role);
      router.push("/manage/dashboard");
      setSocket(generateSocketInstace(result.payload.data.accessToken));
    } catch (error: any) {
      const errors =
        (error?.payload?.errors as { field: string; message: string }[]) ?? [];

      if (errors.length > 0) {
        errors.forEach(({ field, message }) => {
          const mappedKey = SERVER_ERROR_MAP[message] ?? message;
          form.setError(field as any, { message: mappedKey });
        });
      } else {
        handleErrorApi({ error, setError: form.setError });
      }
    }
  };

  return (
    <Card className="mx-auto max-w-[420px] w-full glass-card border-secondary/20 shadow-2xl shadow-secondary/5 p-8 flex flex-col gap-8 relative overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-500">
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      {/* Decorative inner glow */}
      <div className="absolute inset-0 rounded-xl border border-secondary/10 pointer-events-none"></div>
      
      <CardHeader className="text-center p-0">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-6 border border-secondary/20 mx-auto group">
          <span className="material-symbols-outlined text-secondary text-2xl group-hover:rotate-12 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
        <CardTitle className="font-serif text-4xl text-secondary mb-2 tracking-tight">{t("title")}</CardTitle>
        <CardDescription className="font-body text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">{t("cardDescription")}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, formState: { errors } }) => (
                <FormItem className="space-y-2">
                  <Label htmlFor="email" className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</Label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xl group-focus-within:text-secondary transition-colors">mail</span>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("placeholderEmail")}
                      className="bg-muted/30 border-border rounded-xl h-14 pl-11 pr-4 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-muted-foreground/40"
                      {...field}
                    />
                  </div>
                  <FormMessage className="text-xs text-red-500 font-medium">
                    {Boolean(errors.email?.message) && displayError(errors.email?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, formState: { errors } }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("labelPassword")}</Label>
                    <a className="font-label-caps text-[10px] uppercase tracking-widest text-secondary hover:text-foreground transition-colors font-bold" href="#">{t("forgotPassword")}</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xl group-focus-within:text-secondary transition-colors">lock</span>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-muted/30 border-border rounded-xl h-14 pl-11 pr-4 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-muted-foreground/40"
                      {...field}
                    />
                  </div>
                  <FormMessage className="text-xs text-red-500 font-medium">
                    {Boolean(errors.password?.message) && displayError(errors.password?.message as any)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold h-14 rounded-xl mt-4 shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
              )}
              {t("buttonLogin")}
            </Button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-grow bg-border"></div>
              <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted-foreground/60">{t("or")}</span>
              <div className="h-[1px] flex-grow bg-border"></div>
            </div>

            <Link href={googleOauthUrl} className="w-full">
              <Button 
                variant="outline" 
                className="w-full bg-muted/20 border-border text-foreground hover:bg-accent h-14 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm" 
                type="button"
              >
                <img alt="Google Logo" className="w-6 h-6 object-contain" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" />
                <span className="font-medium">{t("loginWithGoogle")}</span>
              </Button>
            </Link>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-secondary transition-all inline-flex items-center gap-2 group/back">
                <span className="material-symbols-outlined text-base group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                <span className="font-medium">{t("backToHome")}</span>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
