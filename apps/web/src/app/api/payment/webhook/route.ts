import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    if (!eventType || !data) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    switch (eventType) {
      case "PAYMENT_STATUS_CHANGED": {
        const { paymentKey, status, orderId } = data;

        if (paymentKey && orderId) {
          await admin
            .from("payments")
            .update({
              status: mapTossStatus(status),
              toss_response: data,
            })
            .eq("order_id", orderId);

          // If payment is cancelled/refunded, update analysis status
          if (status === "CANCELED" || status === "PARTIAL_CANCELED") {
            const { data: payment } = await admin
              .from("payments")
              .select("analysis_id")
              .eq("order_id", orderId)
              .single();

            if (payment) {
              await admin
                .from("analyses")
                .update({ status: "pending_payment" })
                .eq("id", payment.analysis_id);
            }
          }
        }
        break;
      }
      default:
        // Unhandled event type - acknowledge receipt
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function mapTossStatus(
  tossStatus: string
): string {
  const statusMap: Record<string, string> = {
    READY: "ready",
    IN_PROGRESS: "in_progress",
    DONE: "done",
    CANCELED: "canceled",
    PARTIAL_CANCELED: "canceled",
    ABORTED: "failed",
    EXPIRED: "failed",
  };
  return statusMap[tossStatus] ?? "failed";
}
