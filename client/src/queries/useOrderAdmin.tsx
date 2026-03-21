import orderApiRequest from "@/app/apiRequests/order";
import { UpdateOrderBodyType } from "@/schemaValidations/order.schema";
import { useMutation, useQueries } from "@tanstack/react-query";

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: UpdateOrderBodyType & { orderId: number }) =>
      orderApiRequest.updataOrder(orderId, body),
  });
};

export const useGetOrderListQuery = () => {
  return useQueries({
    queries: [
      {
        queryFn: orderApiRequest.getOrderList,
        queryKey: ["orders"],
      },
    ],
  });
};
