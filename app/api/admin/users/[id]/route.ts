import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, string> = {};

    if (body.role && ["USER", "MODERATOR", "ADMIN"].includes(body.role)) {
      updateData.role = body.role;
    }

    if (body.plan && ["FREE", "STANDARD", "PRO"].includes(body.plan)) {
      updateData.plan = body.plan;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "更新する項目がありません" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
