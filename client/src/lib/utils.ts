import { UseFormSetError } from "react-hook-form";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { EntityError, HttpError } from "./http";
import jwt from "jsonwebtoken";
import authApiRequest from "../app/apiRequests/auth";
import { DishStatus, OrderStatus, TableStatus } from "../constants/type";
import envConfig from "../config";
import { TokenPayload } from "@/types/jwt.types";
import guestApiRequest from "@/app/apiRequests/guest";
import { keyof } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  // lỗi validation 422
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
    return;
  }

  // lỗi http
  if (error instanceof HttpError) {
    toast.error(error.payload?.message ?? "Có lỗi xảy ra", {
      duration: duration ?? 5000,
    });
    return;
  }

  // lỗi khác
  toast.error(error?.message ?? "Lỗi không xác định", {
    duration: duration ?? 5000,
  });
};

const isBrowser = typeof window !== "undefined";

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("accessToken", value);

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("refreshToken", value);

export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem("accessToken");
  isBrowser && localStorage.removeItem("refreshToken");
};

export const checkAndRefreshToken = async (params?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
  // Không nên đưa logic lấy access Token và refresh Token ra khỏi function "checkAndRefreshToken"
  // vì để mỗi lần mà checkAndRefreshToken() được gọi thì sẽ có 1 access và 1 refresh mới
  // tránh hiện tượng bug lấy AT và RT cũ ở lần đầu sử dụng cho các lần tiếp theo
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  // Chưa đăng nhập thì cũng không cho chạy
  if (!accessToken || !refreshToken) return;
  const decodedAccessToken = decodeToken(accessToken);

  const decodedRefreshToken = decodeToken(refreshToken);
  // thời điểm hết hạn của token là epoch time (S)
  const now = new Date().getTime() / 1000 - 1;
  //trường hợp RT hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    console.log("Refresh Token het han roi");
    removeTokensFromLocalStorage();
    params?.onError && params?.onError();
  }
  // Còn 1/3 thời gian hết hạn của RT thì mới xử lý
  // Thời gian còn lại tính theo công thức :  decodedAccessToken.exp - now
  // Thời gian hết hạn của AT tính theo công thức : decodedAccessToken.exp - decodedAccessToken.iat
  if (
    decodedAccessToken.exp - now <
    (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    // Gọi API RT
    try {
      const role = decodedRefreshToken.role;
      const res =
        role === Role.Guest
          ? await guestApiRequest.refreshToken()
          : await authApiRequest.refreshToken();
      setAccessTokenToLocalStorage(res.payload.data.accessToken);
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
      params?.onSuccess && params.onSuccess();
    } catch (error) {
      params?.onError && params?.onError();
    }
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export const getVietnameseDishStatus = (
  status: (typeof DishStatus)[keyof typeof DishStatus],
) => {
  switch (status) {
    case DishStatus.Available:
      return "Có sẵn";
    case DishStatus.Unavailable:
      return "Không có sẵn";
    default:
      return "Ẩn";
  }
};

export const getVietnameseTableStatus = (
  status: (typeof TableStatus)[keyof typeof TableStatus],
) => {
  switch (status) {
    case TableStatus.Available:
      return "Có sẵn";
    case TableStatus.Reserved:
      return "Đã đặt";
    default:
      return "Ẩn";
  }
};

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus],
) => {
  switch (status) {
    case OrderStatus.Delivered:
      return "Đã giao";
    case OrderStatus.Paid:
      return "Đã thanh toán";
    case OrderStatus.Pending:
      return "Chờ xử lý";
    case OrderStatus.Processing:
      return "Đang nấu";
    default:
      "Từ chối";
  }
};

export const getTableLink = ({
  token,
  tableNumber,
}: {
  token: string;
  tableNumber: number;
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL + "/tables/" + tableNumber + "?token=" + token
  );
};

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};
