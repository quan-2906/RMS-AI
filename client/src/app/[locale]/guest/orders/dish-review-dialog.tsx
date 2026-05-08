"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { handleErrorApi } from "@/lib/utils";
import { useCreateReviewMutation } from "@/queries/useReview";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function DishReviewDialog({
  dishId,
  dishName,
}: {
  dishId: number;
  dishName: string;
}) {
  const t = useTranslations("DishReview");
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createReviewMutation = useCreateReviewMutation();

  const handleReview = async () => {
    try {
      if (rating < 1 || rating > 5) {
        toast.error(t("ratingError"));
        return;
      }
      await createReviewMutation.mutateAsync({
        dishId,
        rating,
        comment,
      });
      toast.success(t("success"));
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs w-fit border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-medium rounded-full"
        >
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl bg-surface-container border-border text-foreground shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{dishName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2 items-center mx-auto mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground stroke-current"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("placeholder")}
            className="col-span-4 bg-background border-border text-foreground rounded-xl focus-visible:ring-secondary"
            rows={4}
          />
        </div>
        <DialogFooter className="mt-2">
          <Button
            type="button"
            onClick={handleReview}
            disabled={createReviewMutation.isPending}
            className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
