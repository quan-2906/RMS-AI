import MenuOrder from "./menu-order";
import { Utensils } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function MenuPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "GuestMenu" });
  const tBrand = await getTranslations({ locale, namespace: "Brand" });
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative min-h-screen">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <header className="relative z-10 w-full flex items-center justify-between glass-nav sticky top-0 border-b border-border p-4 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center shadow-lg">
            <Utensils className="text-secondary w-5 h-5" />
          </div>
          <h1 className="text-lg text-secondary font-serif font-semibold tracking-wide uppercase">
            {tBrand("title")}
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
          <Utensils className="text-secondary w-4 h-4" />
          <span className="text-sm font-medium text-secondary">{t("table", { number: "03" })}</span>
        </div>
      </header>

      <div className="relative z-10 px-4">
        <MenuOrder />
      </div>
    </div>
  );
}
