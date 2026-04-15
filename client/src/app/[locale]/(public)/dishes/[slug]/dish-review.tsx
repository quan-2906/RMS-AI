"use client";

import { useAppStore } from "@/components/ui/app-provider";
import { formatDateTimeToLocaleString, handleErrorApi } from "@/lib/utils";
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsByDishId,
} from "@/queries/useReview";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Role } from "@/constants/type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function DishReviews({ dishId }: { dishId: number }) {
  const t = useTranslations("DishReview");
  const role = useAppStore((state) => state.role);
  const { data: getReviewsRes, isLoading } = useGetReviewsByDishId(dishId);
  const createMutation = useCreateReviewMutation();
  const deleteMutation = useDeleteReviewMutation(dishId);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const reviews = getReviewsRes?.payload.data || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  const hasReviewed = role === Role.Guest && reviews.some((r) => false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    try {
      await createMutation.mutateAsync({
        dishId,
        rating,
        comment,
      });
      toast.success(t("submit") + " thành công");
      setRating(0);
      setComment("");
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa đánh giá thành công");
      setRating(0);
      setComment("");
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <div className="mt-10 pt-10 border-t space-y-8">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-muted/50 p-6 rounded-lg">
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
          <div className="flex justify-center text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={
                  star <= Math.round(avgRating)
                    ? "fill-current"
                    : "text-muted-foreground opacity-30"
                }
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {t("totalReviews", { count: totalReviews })}
          </p>
        </div>

        <div className="space-y-2">
          {distribution.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-right">{stars} sao</span>
              <Progress
                value={totalReviews > 0 ? (count / totalReviews) * 100 : 0}
                className="h-2"
              />
              <span className="w-8 text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form - Only for Guests */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("writeReview")}</h3>
        {role !== Role.Guest ? (
          <div className="text-center py-6 text-muted-foreground">
            {t("loginToReview")}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("yourRating")}
              </label>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className={`cursor-pointer transition-all ${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400 scale-110"
                        : "text-muted-foreground hover:scale-110"
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("comment")}
              </label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || rating === 0}
              className="w-full sm:w-auto"
            >
              {t("submit")}
            </Button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 opacity-50">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t("noReviews")}
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-card border rounded-lg p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">
                      {review.guestName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTimeToLocaleString(review.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= review.rating
                              ? "fill-current"
                              : "text-muted-foreground opacity-30"
                          }
                        />
                      ))}
                    </div>

                    {/* Only show delete button if it's the current user's review.
                        Currently, we can't perfectly verify identity without guestId in local storage,
                        but we let backend deny the delete request.
                        In a real app, guestId would be kept in auth context. */}
                    {role === Role.Guest && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("deleteReview")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("confirmDelete")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm border-l-2 pl-3 ml-1 italic text-foreground/80">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
