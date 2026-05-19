"use client";

import { useState } from "react";
import { useAccountMe, useGenerate2FAMutation, useVerifySetup2FAMutation, useDisable2FAMutation } from "@/queries/useAccount";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { LoaderCircle, ShieldCheck, ShieldAlert } from "lucide-react";

export default function TwoFactorSetup() {
  const { data: meData, refetch } = useAccountMe();
  const isEnabled = meData?.payload.data.isTwoFactorEnabled;

  const generate2FAMutation = useGenerate2FAMutation();
  const verifySetup2FAMutation = useVerifySetup2FAMutation();
  const disable2FAMutation = useDisable2FAMutation();

  const [step, setStep] = useState<"idle" | "setup" | "disable">("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const handleStartSetup = async () => {
    try {
      const res = await generate2FAMutation.mutateAsync();
      setQrCodeUrl(res.payload.data.qrCodeUrl);
      setStep("setup");
      setOtp("");
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }
    try {
      await verifySetup2FAMutation.mutateAsync({ otp });
      toast.success("Đã bật xác thực 2 bước (2FA) thành công!");
      setStep("idle");
      refetch();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleStartDisable = () => {
    setStep("disable");
    setPassword("");
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu hiện tại để tắt 2FA");
      return;
    }
    try {
      await disable2FAMutation.mutateAsync({ password });
      toast.success("Đã tắt xác thực 2 bước.");
      setStep("idle");
      refetch();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <Card className="w-full shadow-lg border-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="w-6 h-6 text-green-500" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-yellow-500" />
          )}
          Bảo mật 2 lớp (2FA)
        </CardTitle>
        <CardDescription>
          Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực từ ứng dụng Google Authenticator mỗi khi đăng nhập.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "idle" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border">
              <div>
                <p className="font-semibold text-sm">Trạng thái bảo mật</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isEnabled ? "Tài khoản của bạn đã được bảo vệ." : "Tài khoản chưa được bảo vệ. Hãy kích hoạt ngay!"}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isEnabled ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
              }`}>
                {isEnabled ? "Đang Bật" : "Đang Tắt"}
              </span>
            </div>

            {isEnabled ? (
              <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl font-bold"
                onClick={handleStartDisable}
              >
                Hủy kích hoạt 2FA
              </Button>
            ) : (
              <Button 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 rounded-xl font-bold"
                onClick={handleStartSetup}
                disabled={generate2FAMutation.isPending}
              >
                {generate2FAMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                Kích hoạt 2FA
              </Button>
            )}
          </div>
        )}

        {step === "setup" && (
          <form className="flex flex-col gap-5 items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleVerifySetup}>
            <div className="bg-white p-3 rounded-xl border border-secondary/20 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-sm">Quét mã QR bằng Google Authenticator</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Mở ứng dụng Authenticator, chọn quét mã QR và quét hình ảnh phía trên. Sau đó nhập mã 6 số được sinh ra để xác nhận.
              </p>
            </div>

            <div className="w-full space-y-2 text-left">
              <Label htmlFor="setup-otp" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Mã xác thực</Label>
              <Input
                id="setup-otp"
                type="text"
                placeholder="Nhập mã 6 chữ số"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                className="h-12 rounded-xl text-center tracking-[0.5em] text-lg font-bold"
              />
            </div>

            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setStep("idle")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 rounded-xl font-bold"
                disabled={verifySetup2FAMutation.isPending}
              >
                {verifySetup2FAMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                Xác thực & Bật
              </Button>
            </div>
          </form>
        )}

        {step === "disable" && (
          <form className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleDisable2FA}>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm text-red-700 dark:text-red-300">
              Cảnh báo: Hành động này sẽ loại bỏ lớp bảo mật 2 lớp của tài khoản. Vui lòng nhập mật khẩu để xác nhận.
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-password">Mật khẩu hiện tại</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Nhập mật khẩu tài khoản"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex gap-2 w-full mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setStep("idle")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="flex-1 h-12 rounded-xl font-bold"
                disabled={disable2FAMutation.isPending}
              >
                {disable2FAMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                Xác nhận Tắt
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
