import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const action = searchParams.get("action");
    const actorId = searchParams.get("actorId");
    const limit = 30;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    // Enrich with actor names
    const actorIds = [...new Set(logs.map((l: { actorId: string }) => l.actorId))];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const actorMap = new Map(actors.map((a: { id: string; name: string | null; email: string | null }) => [a.id, a]));

    const enrichedLogs = logs.map((l: { actorId: string; targetId: string | null; [key: string]: unknown }) => ({
      ...l,
      actorName: actorMap.get(l.actorId)?.name ?? actorMap.get(l.actorId)?.email ?? "不明",
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
