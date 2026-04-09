import { handleErrorApi } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useEffect } from "react";
import { useAppStore } from "./app-provider";
import { usePathname, useRouter } from "@/i18n/navigation";

const UNAUTHENTICATED_PATH = ["/login", "/logout", "/refresh-token"];

export default function ListenLogoutSocket() {
  const router = useRouter();
  const pathname = usePathname();
  const { isPending, mutateAsync } = useLogoutMutation();
  const setRole = useAppStore((state) => state.setRole);
  const socket = useAppStore((state) => state.socket);
  const disconnectSocket = useAppStore((state) => state.disconnectSocket);
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return;
    async function onLogout() {
      if (isPending) return;
      try {
        await mutateAsync();
        setRole();
        disconnectSocket();
        router.push("/");
      } catch (error: any) {
        handleErrorApi({
          error,
        });
      }
    }
    socket?.on("logout", onLogout);
    return () => {
      socket?.off("logout", onLogout);
    };
  }, [
    socket,
    pathname,
    isPending,
    disconnectSocket,
    mutateAsync,
    setRole,
    router,
  ]);
  return null;
}
