import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { changePasswordSchema } from "@/lib/validations/user";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
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
}
