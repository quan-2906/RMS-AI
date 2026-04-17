"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { handleErrorApi, formatCurrency } from "@/lib/utils";
import { useGuestPayMutation } from "@/queries/useGuest";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function QrPaymentDialog({
  amount,
  onSuccess,
}: {
  amount: number;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const guestPayMutation = useGuestPayMutation();

  const handlePay = async () => {
    try {
      await guestPayMutation.mutateAsync();
      toast.success("Thanh toán thành công!");
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const bankBin = "970422"; // MB Bank
  const bankAccount = "0826477024";
  const qrImage = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact.png?amount=${amount}&addInfo=Thanh toan don hang`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Thanh toán bằng QR</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thanh toán đơn hàng</DialogTitle>
          <DialogDescription>
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán{" "}
            {formatCurrency(amount)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Image
            src={qrImage}
            alt="QR Code thanh toán"
            width={250}
            height={250}
            className="rounded-md"
            unoptimized // Bypass Next.js image optimization cho ảnh từ externe domain nếu bị lỗi hostname
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handlePay}
            disabled={guestPayMutation.isPending}
            className="w-full"
          >
            Tôi đã chuyển khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
