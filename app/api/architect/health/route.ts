import { NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const start = Date.now();
    let dbStatus = "OK";
    let dbLatency = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
    } catch {
      dbStatus = "ERROR";
      dbLatency = Date.now() - start;
    }

    const memUsage = process.memoryUsage();

    return NextResponse.json({
      status: dbStatus === "OK" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
