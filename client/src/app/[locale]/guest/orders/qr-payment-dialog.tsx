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
import { useTranslations } from "next-intl";

export default function QrPaymentDialog({
  amount,
  onSuccess,
}: {
  amount: number;
  onSuccess?: () => void;
}) {
  const t = useTranslations("QrPayment");
  const [open, setOpen] = useState(false);
  const guestPayMutation = useGuestPayMutation();

  const handlePay = async () => {
    try {
      await guestPayMutation.mutateAsync();
      toast.success(t("success"));
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

  const bankBin = "970422";
  const bankAccount = "0826477024";
  const qrImage = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact.png?amount=${amount}&addInfo=${t("qrInfo")}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4 h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl bg-surface-container border-border text-foreground shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { amount: formatCurrency(amount) })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6 bg-white rounded-xl mt-4">
          <Image
            src={qrImage}
            alt={t("qrAlt")}
            width={250}
            height={250}
            className="rounded-md"
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
