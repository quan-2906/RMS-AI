import z from "zod";

export const CreateReviewBody = z.object({
  dishId: z.coerce.number(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(5000).optional(),
});

export type CreateReviewBodyType = z.TypeOf<typeof CreateReviewBody>;

export const ReviewSchema = z.object({
  id: z.number(),
  dishId: z.number(),
  guestId: z.number(),
  guestName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ReviewType = z.TypeOf<typeof ReviewSchema>;

export const ReviewRes = z.object({
  data: ReviewSchema,
  message: z.string(),
});

export type ReviewResType = z.TypeOf<typeof ReviewRes>;

export const ReviewListRes = z.object({
  data: z.array(ReviewSchema),
  message: z.string(),
});

export type ReviewListResType = z.TypeOf<typeof ReviewListRes>;
