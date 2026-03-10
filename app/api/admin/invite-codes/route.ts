import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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

// GET: List all invite codes
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const codes = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ codes });
}

// POST: Create a new invite code
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      code: customCode,
      description,
      maxUses = 1,
      expiresAt,
    } = body as {
      code?: string;
      description?: string;
      maxUses?: number;
      expiresAt?: string;
    };

    const code = customCode?.trim().toUpperCase() || generateCode();

    // Check for uniqueness
    const existing = await prisma.inviteCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "このコードは既に存在します" },
        { status: 400 }
      );
    }

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        description: description || null,
        maxUses: Math.max(1, maxUses),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: admin.id,
      },
    });

    await logAudit({
      actorId: admin.id,
      action: "CREATE_INVITE_CODE",
      targetId: inviteCode.id,
      targetType: "INVITE_CODE",
      details: `Created invite code: ${code}`,
    });

    return NextResponse.json({ inviteCode }, { status: 201 });
  } catch (error) {
    console.error("Create invite code error:", error);
    return NextResponse.json(
      { error: "招待コードの作成に失敗しました" },
      { status: 500 }
    );
  }
}
