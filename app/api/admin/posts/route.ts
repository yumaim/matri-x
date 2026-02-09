import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (status && ["DRAFT", "PUBLISHED", "FLAGGED", "REMOVED"].includes(status)) {
      where.status = status;
    }

    if (
      category &&
      ["ALGORITHM", "VERIFICATION", "STRATEGY", "UPDATES", "QUESTIONS"].includes(category)
    ) {
      where.category = category;
    }

    if (search) {
      where.title = { contains: search };
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
          _count: { select: { votes: true, comments: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
