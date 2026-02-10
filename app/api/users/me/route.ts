import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/user";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  plan: true,
  company: true,
  community: true,
  bio: true,
  website: true,
  xHandle: true,
  headerColor: true,
  createdAt: true,
} as const;

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: USER_SELECT,
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "入力内容を確認してください", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: USER_SELECT,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

const VALID_HEADER_COLORS = ["blue", "purple", "green", "orange", "red"];

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { headerColor } = body;

    if (!headerColor || !VALID_HEADER_COLORS.includes(headerColor)) {
      return NextResponse.json(
        { error: "無効なカラーです" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { headerColor },
      select: USER_SELECT,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
