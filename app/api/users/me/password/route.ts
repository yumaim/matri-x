import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { changePasswordSchema } from "@/lib/validations/user";
import { checkRateLimit } from "@/lib/rate-limit";

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();

    // Rate limit: 5 password changes per hour
    const { allowed } = checkRateLimit(`password:${session.user.id}`, 5, 3600000);
    if (!allowed) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "入力内容を確認してください", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "このアカウントはパスワード認証を使用していません" },
        { status: 400 }
      );
    }

    const isValid = await compare(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "パスワードを変更しました" });
  } catch (error) {
    return handleApiError(error);
  }
}
