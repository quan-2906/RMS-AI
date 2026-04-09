"use client";

import { checkAndRefreshToken } from "@/lib/utils";
import { useEffect } from "react";
import { useAppStore } from "./app-provider";
import { useRouter, usePathname } from "@/i18n/navigation";

// Những page này không cần check refresh Token
const unAuthenticatad_Path = ["/login", "/logout", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();
  const router = useRouter();
  const isAuth = useAppStore((state) => state.isAuth);
  const disconnectSocket = useAppStore((state) => state.disconnectSocket);
  const socket = useAppStore((state) => state.socket);
  useEffect(() => {
    if (!isAuth) return;
    if (unAuthenticatad_Path.includes(pathName)) return;

    let interval: any = null;

    const onRefreshToken = (force?: boolean) =>
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval);
          disconnectSocket();
          router.push("/login");
        },
        force,
      });
    onRefreshToken();
    // Timeout interval phải bé hơn thời gian hết hạn của accessToken
    const TIMEOUT = 10000;
    interval = setInterval(onRefreshToken, TIMEOUT);

    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnect");
    }

    function onRefreshTokenSocket() {
      onRefreshToken(true);
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("refresh-token", onRefreshTokenSocket);
    return () => {
      clearInterval(interval);
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("refresh-token", onRefreshTokenSocket);
    };
  }, [pathName, router, isAuth, socket, disconnectSocket]);

  return null;
}
