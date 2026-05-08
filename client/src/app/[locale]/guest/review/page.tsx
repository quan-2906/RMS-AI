import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ReviewList from "./review-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("GuestReview");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function GuestReviewPage() {
  const t = await getTranslations("GuestReview");

  return (
    <main className="flex-1 relative min-h-screen pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-[480px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <header className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-3xl text-secondary font-serif font-bold tracking-wide">
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-body mt-1 text-sm">
            {t("description")}
          </p>
        </header>

        {/* Danh sách món cần đánh giá */}
        <ReviewList />
      </div>
    </main>
  );
}
