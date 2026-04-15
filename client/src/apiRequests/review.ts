import http from "@/lib/http";
import {
  CreateReviewBodyType,
  ReviewListResType,
  ReviewResType,
} from "@/schemaValidations/review.schema";
import { MessageResType } from "@/schemaValidations/common.schema";

const reviewApiRequest = {
  getByDishId: (dishId: number) =>
    http.get<ReviewListResType>(`reviews/dish/${dishId}`, {
      next: { tags: ["reviews", `dish-${dishId}`], revalidate: 60 },
    }),

  create: (body: CreateReviewBodyType) =>
    http.post<ReviewResType>("reviews", body),

  delete: (id: number) => http.delete<MessageResType>(`reviews/${id}`),
};

export default reviewApiRequest;
