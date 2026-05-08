import { Suspense } from "react";
import DishTable from "./dish-table";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DishesPage() {
  const t = useTranslations("ManageDishes");
  return (
    <main className="flex-1 relative min-h-screen pb-10">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 md:px-8 space-y-6">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl text-secondary font-serif font-bold tracking-wide">
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-body mt-1 text-sm">
              {t("description")}
            </p>
          </div>
        </header>
        <Suspense>
          <DishTable />
        </Suspense>
      </div>
    </main>
  );
}
