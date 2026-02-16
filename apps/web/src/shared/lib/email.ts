import { Resend } from "resend";

const FROM_EMAIL = "계약서 지킴이 <noreply@contract-guardian.kr>";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendPaymentConfirmEmail(params: {
  to: string;
  orderName: string;
  amount: number;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[계약서 지킴이] 결제가 완료되었습니다`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>결제 완료</h2>
          <p>${params.orderName}의 결제가 완료되었습니다.</p>
          <p>결제 금액: ${params.amount.toLocaleString()}원</p>
          <p>분석이 자동으로 시작됩니다. 완료되면 알림을 보내드리겠습니다.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">계약서 지킴이 - AI 계약서 분석 서비스</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment email:", error);
  }
}

export async function sendAnalysisCompleteEmail(params: {
  to: string;
  analysisId: string;
  fileName: string;
  riskLevel: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const riskLabel = params.riskLevel === "high" ? "위험" : params.riskLevel === "medium" ? "주의" : "안전";
  const riskColor = params.riskLevel === "high" ? "#ef4444" : params.riskLevel === "medium" ? "#f59e0b" : "#22c55e";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[계약서 지킴이] 분석이 완료되었습니다 - ${riskLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>분석 완료</h2>
          <p><strong>${params.fileName}</strong>의 분석이 완료되었습니다.</p>
          <div style="padding: 16px; border-radius: 8px; background: #f9fafb; margin: 16px 0;">
            <p style="margin: 0;">종합 위험도: <span style="color: ${riskColor}; font-weight: bold;">${riskLabel}</span></p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr"}/analysis/${params.analysisId}"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
            분석 결과 보기
          </a>
          <hr style="margin-top: 24px;" />
          <p style="color: #666; font-size: 12px;">계약서 지킴이 - AI 계약서 분석 서비스</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send analysis email:", error);
  }
}

export async function sendAnalysisFailedEmail(params: {
  to: string;
  fileName: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[계약서 지킴이] 분석에 실패했습니다`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>분석 실패</h2>
          <p><strong>${params.fileName}</strong>의 분석 중 오류가 발생했습니다.</p>
          <p>다시 시도해주시거나, 문제가 계속되면 support@contract-guardian.kr로 문의해주세요.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr"}/analyze"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
            다시 시도
          </a>
          <hr style="margin-top: 24px;" />
          <p style="color: #666; font-size: 12px;">계약서 지킴이 - AI 계약서 분석 서비스</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send failed analysis email:", error);
  }
}
