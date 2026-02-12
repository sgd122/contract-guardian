"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@cg/ui";
import { formatCurrency } from "@cg/shared";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onConfirm: () => Promise<void>;
}

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  onConfirm,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>결제하기</DialogTitle>
          <DialogDescription>
            계약서 분석을 위해 결제를 진행합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <span className="text-sm text-muted-foreground">결제 금액</span>
            <span className="text-xl font-bold">
              {formatCurrency(amount)}
            </span>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>- 결제 후 즉시 AI 분석이 시작됩니다.</p>
            <p>- 분석 시작 전 전액 환불이 가능합니다.</p>
            <p>- 결제 관련 문의: support@contract-guardian.kr</p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formatCurrency(amount)} 결제하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
