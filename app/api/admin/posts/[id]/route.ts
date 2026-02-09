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

    const updateData: Record<string, unknown> = {};

    if (typeof body.isPinned === "boolean") {
      updateData.isPinned = body.isPinned;
    }

    if (typeof body.isVerified === "boolean") {
      updateData.isVerified = body.isVerified;
    }

    if (
      body.status &&
      ["DRAFT", "PUBLISHED", "FLAGGED", "REMOVED"].includes(body.status)
    ) {
      updateData.status = body.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "更新する項目がありません" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        isPinned: true,
        isVerified: true,
        status: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}
