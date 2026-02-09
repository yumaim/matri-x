import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
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
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}
