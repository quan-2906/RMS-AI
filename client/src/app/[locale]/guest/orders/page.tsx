import OrderCart from "./orders-cart";
import { getTranslations } from "next-intl/server";

export default async function OrderPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "GuestOrders" });
  
  return (
    <main className="flex-1 relative min-h-screen pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6">
        <header className="mb-6 flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-3xl text-secondary font-serif font-bold tracking-wide">
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-body mt-1 text-sm">
            {t("description")}
          </p>
        </header>
        
        <OrderCart />
      </div>
    </main>
  );
}
