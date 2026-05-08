import DashboardMain from "@/app/[locale]/manage/dashboard/dashboard-main";
import { getTranslations } from "next-intl/server";

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return (
    <main className="flex-1 relative min-h-screen pb-10">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 md:px-8 space-y-6">
        <header className="mb-6">
          <h1 className="text-3xl text-secondary font-serif font-bold tracking-wide">
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-body mt-1 text-sm">
            {t("description")}
          </p>
        </header>

        <DashboardMain />
      </div>
    </main>
  );
}
