import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = await prisma.algorithmUpdate.findMany({
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ updates });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, source, impact, category } = body;

  if (!title || !description || !impact || !category) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const update = await prisma.algorithmUpdate.create({
    data: { title, description, source: source || null, impact, category },
  });

  return NextResponse.json({ update }, { status: 201 });
}
