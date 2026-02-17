"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseRefundOptions {
  refresh: () => Promise<void>;
}

interface UseRefundReturn {
  refundDialogOpen: boolean;
  refundingId: string | null;
  refundReason: string;
  setRefundDialogOpen: (open: boolean) => void;
  setRefundReason: (reason: string) => void;
  handleRefundClick: (e: React.MouseEvent, analysisId: string) => void;
  handleConfirmRefund: () => Promise<void>;
}

export function useRefund({ refresh }: UseRefundOptions): UseRefundReturn {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const handleRefundClick = (e: React.MouseEvent, analysisId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRefundingId(analysisId);
    setRefundDialogOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundingId || !refundReason.trim()) {
      toast.error("환불 사유를 입력해주세요.");
      return;
    }

    setRefundDialogOpen(false);
    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: refundingId, reason: refundReason }),
      });

      if (res.ok) {
        toast.success("환불이 완료되었습니다.");
        await refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "환불에 실패했습니다.");
      }
    } catch {
      toast.error("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setRefundingId(null);
      setRefundReason("");
    }
  };

  return {
    refundDialogOpen,
    refundingId,
    refundReason,
    setRefundDialogOpen,
    setRefundReason,
    handleRefundClick,
    handleConfirmRefund,
  };
}
