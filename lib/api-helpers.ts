import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "認証が必要です");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  // DB check for real-time role verification (H-6 fix)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    throw new ApiError(403, "管理者権限が必要です");
  }
  return session;
}

export async function requirePlan(minPlan: "STANDARD" | "PRO") {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const planLevel: Record<string, number> = { FREE: 0, STANDARD: 1, PRO: 2 };
  const userLevel = planLevel[user?.plan ?? "FREE"] ?? 0;
  const requiredLevel = planLevel[minPlan] ?? 1;
  if (userLevel < requiredLevel) {
    throw new ApiError(403, `${minPlan}プラン以上が必要です`);
  }
  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "サーバーエラーが発生しました" },
    { status: 500 }
  );
}
