import { prisma } from "@/lib/db";

export type AuditAction =
  | "BAN"
  | "UNBAN"
  | "CHANGE_ROLE"
  | "CHANGE_PLAN"
  | "UPDATE_TICKET"
  | "CREATE_UPDATE"
  | "DELETE_UPDATE"
  | "UPDATE_POST";

export async function logAudit(params: {
  actorId: string;
  action: AuditAction;
  targetId?: string;
  targetType?: "USER" | "TICKET" | "UPDATE" | "POST";
  details?: string;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetId: params.targetId ?? null,
        targetType: params.targetType ?? null,
        details: params.details ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error("Audit log error:", error);
  }
}
