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

export default function DishReviewDialog({
  dishId,
  dishName,
}: {
  dishId: number;
  dishName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createReviewMutation = useCreateReviewMutation();

  const handleReview = async () => {
    try {
      if (rating < 1 || rating > 5) {
        toast.error("Vui lòng chọn từ 1 đến 5 sao");
        return;
      }
      await createReviewMutation.mutateAsync({
        dishId,
        rating,
        comment,
      });
      toast.success("Đánh giá thành công!");
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
          variant={"outline"}
          size={"sm"}
          className="h-7 px-3 text-xs w-fit"
        >
          Đánh giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đánh giá món ăn</DialogTitle>
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
            placeholder="Bạn thấy món ăn này thế nào?"
            className="col-span-4"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleReview}
            disabled={createReviewMutation.isPending}
          >
            Lưu đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
