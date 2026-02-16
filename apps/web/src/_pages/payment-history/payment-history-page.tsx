"use client";

import { useMemo, useState, useEffect } from "react";
import { Calendar, CreditCard, FileText, AlertCircle } from "lucide-react";
import {
  Badge,
  AnimatedCard,
  StaggerList,
  FadeIn,
} from "@cg/ui";
import { createApiClient } from "@cg/api";
import { formatCurrency, formatDate, type Payment, type PaymentStatus } from "@cg/shared";

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  ready: { label: "대기 중", variant: "secondary" },
  in_progress: { label: "진행 중", variant: "default" },
  done: { label: "완료", variant: "default" },
  canceled: { label: "취소됨", variant: "outline" },
  failed: { label: "실패", variant: "destructive" },
  refunded: { label: "환불됨", variant: "outline" },
};

export function PaymentHistoryPage() {
  const client = useMemo(() => createApiClient({ baseURL: "" }), []);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get<Payment[]>("/api/payment/history");
        setPayments(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("결제 내역을 불러오는데 실패했습니다"));
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [client]);

  return (
    <div>
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold">결제 내역</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            결제 및 환불 내역을 확인하세요
          </p>
        </div>
      </FadeIn>

      <div className="mt-8">
        {loading ? (
          <FadeIn>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border bg-muted/50"
                />
              ))}
            </div>
          </FadeIn>
        ) : error ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <AlertCircle className="h-12 w-12 text-destructive/50" />
              <h3 className="mt-4 text-lg font-medium">
                결제 내역을 불러올 수 없습니다
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {error.message}
              </p>
            </div>
          </FadeIn>
        ) : payments.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">
                결제 내역이 없습니다
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                계약서 분석 결제 시 이곳에 내역이 표시됩니다
              </p>
            </div>
          </FadeIn>
        ) : (
          <StaggerList className="space-y-4">
            {payments.map((payment) => {
              const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
              const orderName =
                (payment.toss_response as { orderName?: string })?.orderName ||
                "계약서 분석";

              return (
                <AnimatedCard key={payment.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium">{orderName}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.created_at)}
                          </span>
                          {payment.method && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {payment.method}
                            </span>
                          )}
                          <span className="text-muted-foreground/50">
                            주문번호: {payment.order_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="text-lg font-semibold">
                        {formatCurrency(payment.amount)}
                      </div>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </StaggerList>
        )}
      </div>
    </div>
  );
}
