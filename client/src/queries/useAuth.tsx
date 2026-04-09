import { useMutation } from "@tanstack/react-query";
import authApiRequest from "../apiRequests/auth";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout,
  });
};

export const useSetTokenCookieMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.setTokenToCookies,
  });
};
