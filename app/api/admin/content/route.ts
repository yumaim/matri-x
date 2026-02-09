import { NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const contentSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().min(1, "説明は必須です"),
  source: z.string().optional(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.string().min(1, "カテゴリは必須です"),
});

export async function GET() {
  try {
    await requireAdmin();

    const updates = await prisma.algorithmUpdate.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ updates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const result = contentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, source, impact, category } = result.data;

    const update = await prisma.algorithmUpdate.create({
      data: { title, description, source: source || null, impact, category },
    });

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
