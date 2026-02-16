import { headers } from "next/headers";
import { createAdminClient } from "@/shared/api/supabase/admin";

type AuditAction =
  | "file.upload"
  | "file.download"
  | "analysis.create"
  | "analysis.delete"
  | "report.download"
  | "payment.confirm"
  | "account.delete";

type ResourceType = "analysis" | "payment" | "report" | "account";

interface AuditLogParams {
  userId: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit({
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
}: AuditLogParams): Promise<void> {
  try {
    const headerStore = await headers();
    const ipAddress =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = headerStore.get("user-agent") ?? null;

    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: metadata ?? {},
    });
  } catch (error) {
    // Audit logging should never break the main request
    console.error("Audit log failed:", error);
  }
}
