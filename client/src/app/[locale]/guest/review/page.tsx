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
    <div className="max-w-[480px] mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Danh sách món cần đánh giá */}
      <ReviewList />
    </div>
  );
}
