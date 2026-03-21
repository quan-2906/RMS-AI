import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),

  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),

  //Serer route handle gọi đến server backend
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string;
    },
  ) =>
    http.post<LogoutBodyType>(
      "/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),

  // Client gọi đến route handle, không cần truyền accesstoken và refreshtoen
  // vì AT và RT tự động gửi thông qua cookies
  logout: () =>
    http.post<LogoutBodyType>("/api/auth/logout", null, {
      baseUrl: "",
    }),

  sRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>("/auth/refresh-token", body),

  refreshToken: () =>
    http.post<RefreshTokenResType>("/api/auth/refresh-token", null, {
      baseUrl: "",
    }),
};

export default authApiRequest;
