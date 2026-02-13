"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@cg/ui";

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") ?? "UNKNOWN";
  const message = searchParams.get("message") ?? "결제에 실패했습니다.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <XCircle className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold">결제에 실패했습니다</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">오류 코드: {code}</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              대시보드로 이동
            </Button>
            <Button onClick={() => router.push("/analyze")}>
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <FailContent />
    </Suspense>
  );
}
