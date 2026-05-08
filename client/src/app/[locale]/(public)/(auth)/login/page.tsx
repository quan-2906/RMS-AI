import LoginForm from "@/app/[locale]/(public)/(auth)/login/login-form";
import Logout from "@/app/[locale]/(public)/(auth)/login/logout";
import envConfig, { Locale } from "@/config";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Login" });
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/login`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
    },
  };
}

export default async function Login(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative bg-gradient-to-br from-background via-surface-container-lowest to-[#1a1510] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <LoginForm />
        <Logout />
      </div>
    </div>
  );
}
