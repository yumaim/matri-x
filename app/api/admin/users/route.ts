import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/admin/users — list all users
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          plan: true,
          banned: true,
          bannedReason: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { posts: true, comments: true, tickets: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateUserSchema = z.object({
  userId: z.string(),
  action: z.enum(["ban", "unban", "changeRole", "changePlan"]),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "STANDARD", "PRO"]).optional(),
  reason: z.string().max(500).optional(),
});

// PUT /api/admin/users — update user (ban/unban/role/plan)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Prevent self-ban
    if (data.userId === session.user.id && data.action === "ban") {
      return NextResponse.json({ error: "自分自身をBANすることはできません" }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (data.action) {
      case "ban":
        updateData = { banned: true, bannedAt: new Date(), bannedReason: data.reason ?? null };
        break;
      case "unban":
        updateData = { banned: false, bannedAt: null, bannedReason: null };
        break;
      case "changeRole":
        if (!data.role) return NextResponse.json({ error: "ロールを指定してください" }, { status: 400 });
        // Prevent removing last admin
        if (data.role !== "ADMIN") {
          const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
          const targetUser = await prisma.user.findUnique({ where: { id: data.userId }, select: { role: true } });
          if (targetUser?.role === "ADMIN" && adminCount <= 1) {
            return NextResponse.json({ error: "最後の管理者のロールは変更できません" }, { status: 400 });
          }
        }
        updateData = { role: data.role };
        break;
      case "changePlan":
        if (!data.plan) return NextResponse.json({ error: "プランを指定してください" }, { status: 400 });
        updateData = { plan: data.plan };
        break;
    }

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: updateData,
      select: { id: true, name: true, role: true, plan: true, banned: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
