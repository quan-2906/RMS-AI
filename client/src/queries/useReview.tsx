import reviewApiRequest from "@/apiRequests/review";
import { CreateReviewBodyType } from "@/schemaValidations/review.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetReviewsByDishId = (dishId: number) => {
  return useQuery({
    queryKey: ["reviews", dishId],
    queryFn: () => reviewApiRequest.getByDishId(dishId),
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewBodyType) => reviewApiRequest.create(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.dishId],
      });
    },
  });
};

export const useDeleteReviewMutation = (dishId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewApiRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", dishId],
      });
    },
  });
};
