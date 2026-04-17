"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/components/ui/app-provider";
import { useRouter } from "@/i18n/navigation";
import { decodeToken, generateSocketInstace } from "@/lib/utils";
import { useSetTokenCookieMutation } from "@/queries/useAuth";
import { toast } from "sonner";

function OAuthContent() {
  const { setRole, setSocket } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const count = useRef(0);

  const message = searchParams.get("message");
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  const { mutateAsync } = useSetTokenCookieMutation();

  useEffect(() => {
    if (accessToken && refreshToken) {
      if (count.current === 0) {
        const { role } = decodeToken(accessToken);
        setRole(role);
        setSocket(generateSocketInstace(accessToken));

        mutateAsync({ accessToken, refreshToken })
          .then(() => {
            router.push("/manage/dashboard");
          })
          .catch((e) => {
            toast("Lỗi", {
              description: e.message || "Có lỗi xãy ra",
            });
          });

        count.current++;
      }
    } else {
      if (count.current === 0) {
        setTimeout(() => {
          toast("Lỗi", {
            description: message || "Có lỗi xãy ra",
          });
          router.push("/login");
        });
        count.current++;
      }
    }
  }, [
    accessToken,
    refreshToken,
    setRole,
    setSocket,
    router,
    message,
    mutateAsync,
  ]);

  return null;
}
export default function OAuthPage() {
  return (
    <Suspense fallback={<div>Đang đăng nhập...</div>}>
      <OAuthContent />
    </Suspense>
  );
}
