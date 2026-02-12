import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Invite-only mode: only admins can register new users
    if (process.env.REGISTRATION_MODE === "invite") {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "招待制のため、管理者にお問い合わせください" }, { status: 403 });
      }
      const admin = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (admin?.role !== "ADMIN") {
        return NextResponse.json({ error: "管理者のみがユーザーを登録できます" }, { status: 403 });
      }
    }

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

    const { name, email, password, company } = result.data;

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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company: company || null,
      },
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
