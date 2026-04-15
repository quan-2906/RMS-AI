"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, Trash2, CheckCircle2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  formatCurrency,
  handleErrorApi,
  decodeToken,
  getAccessTokenFromLocalStorage,
} from "@/lib/utils";
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsByDishId,
} from "@/queries/useReview";

interface DishReviewCardProps {
  dishId: number;
  dishName: string;
  dishImage: string;
  dishPrice: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`focus:outline-none transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function DishReviewCard({
  dishId,
  dishName,
  dishImage,
  dishPrice,
}: DishReviewCardProps) {
  const t = useTranslations("GuestReview");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Lấy guestId từ access token
  const guestId = (() => {
    try {
      const token = getAccessTokenFromLocalStorage();
      if (!token) return null;
      return decodeToken(token).userId as number;
    } catch {
      return null;
    }
  })();

  const { data: reviewsData, isLoading } = useGetReviewsByDishId(dishId);
  const reviews = reviewsData?.payload?.data ?? [];

  // Tìm review của guest hiện tại
  const myReview = guestId
    ? reviews.find((r) => r.guestId === guestId)
    : undefined;

  const createReviewMutation = useCreateReviewMutation();
  const deleteReviewMutation = useDeleteReviewMutation(dishId);

  const handleSubmit = async () => {
    try {
      await createReviewMutation.mutateAsync({ dishId, rating, comment });
      toast.success(t("reviewSuccess"));
      setComment("");
      setRating(5);
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    try {
      await deleteReviewMutation.mutateAsync(myReview.id);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4 border-b bg-muted/30">
        <div className="flex-shrink-0">
          <Image
            src={dishImage}
            alt={dishName}
            width={72}
            height={72}
            quality={90}
            className="object-cover rounded-lg w-[72px] h-[72px]"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {dishName}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {formatCurrency(dishPrice)}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-start pt-0.5">
          {myReview ? (
            <Badge
              variant="default"
              className="gap-1 bg-green-500/15 text-green-600 hover:bg-green-500/20 border-green-500/30 text-xs"
            >
              <CheckCircle2 className="w-3 h-3" />
              {t("alreadyReviewed")}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 text-muted-foreground text-xs"
            >
              <MessageSquarePlus className="w-3 h-3" />
              {t("pendingReview")}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex gap-1 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : myReview ? (
          /* ── Đã đánh giá ── */
          <div className="space-y-3">
            <StarRating value={myReview.rating} readonly />
            {myReview.comment && (
              <p className="text-sm text-muted-foreground italic leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
                "{myReview.comment}"
              </p>
            )}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                {new Date(myReview.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs">{t("deleteReview")}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteReview")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("confirmDelete")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {t("deleteReview")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          /* ── Chưa đánh giá — form ── */
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                {t("yourRating")}
              </p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={3}
              className="resize-none text-sm"
            />
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={createReviewMutation.isPending}
            >
              <Star className="w-4 h-4" />
              {t("submit")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
