import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: any = {};

  if (typeof body.isPinned === "boolean") data.isPinned = body.isPinned;
  if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;
  if (body.status && ["PUBLISHED", "FLAGGED", "REMOVED"].includes(body.status)) {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const post = await prisma.forumPost.update({
    where: { id },
    data,
    select: { id: true, title: true, isPinned: true, isVerified: true, status: true },
  });

  return NextResponse.json({ post });
}
