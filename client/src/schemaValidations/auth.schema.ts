import { Role } from "@/constants/type";
import z from "zod";

export const LoginBody = z
  .object({
    email: z
      .string()
      .min(1, { message: "required" })
      .email({ message: "invalidEmail" }),

    password: z
      .string()
      .min(1, { message: "required" })
      .min(6, { message: "minmaxPassword" })
      .max(100, { message: "minmaxPassword" }),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LOGIN_ERROR_KEYS = [
  "required",
  "invalidEmail",
  "minmaxPassword",
  "invalidCredentials",
  "emailNotFound",
] as const;

export type LoginErrorKey = (typeof LOGIN_ERROR_KEYS)[number];

export const isLoginErrorKey = (message: string): message is LoginErrorKey =>
  LOGIN_ERROR_KEYS.includes(message as LoginErrorKey);

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    account: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      role: z.enum([Role.Owner, Role.Employee]),
      avatar: z.string().nullable(),
    }),
  }),
  message: z.string(),
});

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>;

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
});

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>;

export const LogoutBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>;

export const LoginGoogleQuery = z.object({
  code: z.string(),
});

export type LoginGoogleQueryType = z.TypeOf<typeof LoginGoogleQuery>;
