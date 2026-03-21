"use client";

import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppContext } from "./app-provider";

// Những page này không cần check refresh Token
const unAuthenticatad_Path = ["/login", "/logout", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();
  const router = useRouter();
  const { isAuth } = useAppContext();

  useEffect(() => {
    if (!isAuth) return;
    if (unAuthenticatad_Path.includes(pathName)) return;

    let interval: any = null;

    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
        router.push("/login");
      },
    });
    // Timeout interval phải bé hơn thời gian hết hạn của accessToken
    const TIMEOUT = 10000;
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            router.push("/login");
          },
        }),
      TIMEOUT,
    );
    return () => {
      clearInterval(interval);
    };
  }, [pathName, router, isAuth]);

  return null;
}
