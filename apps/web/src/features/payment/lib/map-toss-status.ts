/**
 * Maps Toss Payments status strings to internal payment status values.
 */
export function mapTossStatus(tossStatus: string): string {
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
