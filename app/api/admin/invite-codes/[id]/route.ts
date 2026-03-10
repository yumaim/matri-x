import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true },
  });
  if (user?.role !== "ADMIN") return null;
  return user;
}

// PATCH: Update invite code (toggle active, update metadata)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, description, maxUses, expiresAt } = body as {
      isActive?: boolean;
      description?: string;
      maxUses?: number;
      expiresAt?: string | null;
    };

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (typeof description === "string") updateData.description = description;
    if (typeof maxUses === "number") updateData.maxUses = Math.max(1, maxUses);
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const inviteCode = await prisma.inviteCode.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      actorId: admin.id,
      action: "UPDATE_INVITE_CODE",
      targetId: id,
      targetType: "INVITE_CODE",
      details: JSON.stringify(updateData),
    });

    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("Update invite code error:", error);
    return NextResponse.json(
      { error: "招待コードの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: Delete invite code
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.inviteCode.delete({ where: { id } });
    await logAudit({
      actorId: admin.id,
      action: "DELETE_INVITE_CODE",
      targetId: id,
      targetType: "INVITE_CODE",
      details: "Deleted invite code",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invite code error:", error);
    return NextResponse.json(
      { error: "招待コードの削除に失敗しました" },
      { status: 500 }
    );
  }
}
