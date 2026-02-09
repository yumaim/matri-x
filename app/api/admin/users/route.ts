import { NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const plan = searchParams.get("plan") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (plan) where.plan = plan;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          company: true,
          createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
