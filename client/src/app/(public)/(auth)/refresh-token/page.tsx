"use client";

import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RefreshToken() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const redirectPathName = searchParams.get("redirect");
  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathName || "/");
        },
      });
    } else {
      router.push("/");
    }
  }, [router, refreshTokenFromUrl, redirectPathName]);
  return <div>Refresh Token ...</div>;
}

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loadding ...</div>}>
      <RefreshToken />
    </Suspense>
  );
}
