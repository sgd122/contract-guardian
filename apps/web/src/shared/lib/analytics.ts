/**
 * GA4 커스텀 이벤트 — 퍼널 측정 (방문 → 업로드 → 결제 → 분석완료)
 */

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GtagEvent) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// ── Funnel Events ──

/** 파일 업로드 시작 */
export function trackUploadStart(fileType: string, fileSizeMB: number) {
  trackEvent({
    action: "upload_start",
    category: "funnel",
    label: fileType,
    value: Math.round(fileSizeMB),
  });
}

/** 파일 업로드 완료 */
export function trackUploadComplete(pageCount: number) {
  trackEvent({
    action: "upload_complete",
    category: "funnel",
    label: `${pageCount}pages`,
    value: pageCount,
  });
}

/** 결제 시작 */
export function trackPaymentStart(amount: number) {
  trackEvent({
    action: "payment_start",
    category: "funnel",
    value: amount,
  });
}

/** 결제 완료 */
export function trackPaymentComplete(amount: number) {
  trackEvent({
    action: "payment_complete",
    category: "funnel",
    value: amount,
  });
}

/** 분석 완료 */
export function trackAnalysisComplete(riskScore: number) {
  trackEvent({
    action: "analysis_complete",
    category: "funnel",
    label: `risk_${riskScore}`,
    value: riskScore,
  });
}

/** PDF 리포트 다운로드 */
export function trackReportDownload() {
  trackEvent({
    action: "report_download",
    category: "engagement",
  });
}

