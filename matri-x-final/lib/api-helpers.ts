import { auth } from "@/lib/auth";
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
  if (session.user.role !== "ADMIN") {
    throw new ApiError(403, "管理者権限が必要です");
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
