import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Invite-code-only registration period deadline
const INVITE_ONLY_DEADLINE = new Date("2026-03-31T23:59:59+09:00");

export async function POST(request: Request) {
  try {
    // Rate limit: 5 registrations per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = checkRateLimit(`register:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, company, inviteCode } = result.data;

    // Validate invite code (required until INVITE_ONLY_DEADLINE)
    const now = new Date();
    const isInviteOnlyPeriod = now <= INVITE_ONLY_DEADLINE;

    if (isInviteOnlyPeriod) {
      if (!inviteCode) {
        return NextResponse.json(
          { error: "招待コードを入力してください" },
          { status: 400 }
        );
      }

      const invite = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      if (!invite) {
        return NextResponse.json(
          { error: "無効な招待コードです" },
          { status: 400 }
        );
      }

      if (!invite.isActive) {
        return NextResponse.json(
          { error: "この招待コードは無効化されています" },
          { status: 400 }
        );
      }

      if (invite.usedCount >= invite.maxUses) {
        return NextResponse.json(
          { error: "この招待コードの使用回数が上限に達しました" },
          { status: 400 }
        );
      }

      if (invite.expiresAt && now > invite.expiresAt) {
        return NextResponse.json(
          { error: "この招待コードの有効期限が切れています" },
          { status: 400 }
        );
      }
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return same message as success to prevent user enumeration (H-4)
      return NextResponse.json(
        { error: "アカウントの作成に問題が発生しました。別のメールアドレスをお試しください。" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and increment invite code usage in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          company: company || null,
          inviteCodeUsed: inviteCode || null,
        },
      });

      // Increment invite code usage
      if (inviteCode && isInviteOnlyPeriod) {
        await tx.inviteCode.update({
          where: { code: inviteCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
