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
    <Card className="mx-auto max-w-md w-full">
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        {...field}
                      />
                      <FormMessage>
                        {Boolean(errors.email?.message) &&
                          displayError(errors.email?.message)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                      <FormMessage>
                        {Boolean(errors.password?.message) &&
                          displayError(errors.password?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {loginMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                {t("buttonLogin")}
              </Button>
              <Link href={googleOauthUrl}>
                <Button variant="outline" className="w-full" type="button">
                  {t("loginWithGoogle")}
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
