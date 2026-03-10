import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const algorithmUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  source: z.string().max(500).optional().nullable(),
  impact: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  category: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updates = await prisma.algorithmUpdate.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("GET /api/admin/content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = algorithmUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, source, impact, category } = result.data;

    const update = await prisma.algorithmUpdate.create({
      data: { title, description, source: source || null, impact, category },
    });

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
