import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { cn } from "../../lib/utils";
import { baseOpenGraph } from "@/shared-metadata";
import NextTopLoader from "nextjs-toploader";
import AppProvider from "../../components/ui/app-provider";
import { ThemeProvider } from "../../components/ui/theme-provider.tsx";
import { Locale } from "@/config";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { CardFooter } from "@/components/ui/card";
import GoogleTag from "@/components/ui/google-tag";
import AiChatbot from "@/components/ai-chatbot";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Brand" });
  return {
    title: {
      template: `%s | ${t("title")}`,
      default: t("defaultTitle"),
    },
    openGraph: {
      ...baseOpenGraph,
    },
    // other: {
    //   'google-site-verification': 'KKr5Sgn6rrXntMUp1nDIoQR7mJQujE4BExrlgcFvGTg'
    // }
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>,
) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextTopLoader showSpinner={false} color="hsl(var(--foreground))" />
        <NextIntlClientProvider messages={messages}>
          <AppProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <AiChatbot />
              <CardFooter />
              <Toaster />

            </ThemeProvider>
          </AppProvider>
        </NextIntlClientProvider>
        <GoogleTag />
      </body>
    </html>
  );
}
