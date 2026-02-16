import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/updates — アルゴリズム更新のみを取得（新機能・お知らせは除外）
export async function GET() {
  try {
    const updates = await prisma.algorithmUpdate.findMany({
      where: {
        type: "ALGORITHM", // アルゴリズム更新のみ
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Failed to fetch updates:", error);
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
  }
}
