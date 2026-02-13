"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardContent } from "@cg/ui";
import { API_ROUTES } from "@cg/shared";
import { createApiClient } from "@cg/api";

type ConfirmState = "confirming" | "analyzing" | "success" | "error";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<ConfirmState>("confirming");
  const [errorMessage, setErrorMessage] = useState("");
  const hasStarted = useRef(false);

  const client = useMemo(() => createApiClient({ baseURL: "" }), []);

  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const analysisId = searchParams.get("analysisId");
  const provider = searchParams.get("provider") ?? "claude";

  useEffect(() => {
    if (hasStarted.current) return;
    if (!orderId || !paymentKey || !amount) {
      setState("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    hasStarted.current = true;

    async function confirmAndStartAnalysis() {
      try {
        await client.post(API_ROUTES.paymentConfirm, {
          orderId,
          paymentKey,
          amount: Number(amount),
        });

        if (analysisId) {
          setState("analyzing");
          await client.post(API_ROUTES.analyze, { analysisId, provider });
          setState("success");
          setTimeout(() => {
            router.push(`/analyze/${analysisId}`);
          }, 1500);
        } else {
          setState("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "결제 확인에 실패했습니다. 고객센터에 문의해주세요."
        );
      }
    }

    confirmAndStartAnalysis();
  }, [orderId, paymentKey, amount, analysisId, provider, client, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          {state === "confirming" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <h2 className="text-lg font-semibold">결제를 확인하고 있습니다</h2>
              <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
            </>
          )}

          {state === "analyzing" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <h2 className="text-lg font-semibold">결제 완료! AI 분석을 시작합니다</h2>
              <p className="text-sm text-muted-foreground">분석 페이지로 이동합니다...</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <h2 className="text-lg font-semibold">결제가 완료되었습니다</h2>
              <p className="text-sm text-muted-foreground">페이지를 이동합니다...</p>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <h2 className="text-lg font-semibold">결제 확인 실패</h2>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  대시보드로 이동
                </Button>
                <Button onClick={() => router.push("/analyze")}>
                  다시 시도
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
