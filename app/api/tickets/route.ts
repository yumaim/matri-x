import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.enum(["FEATURE_REQUEST", "BUG_REPORT", "IMPROVEMENT", "OTHER"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
});

// GET /api/tickets — list user's tickets
export async function GET() {
  try {
    const session = await requireAuth();

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tickets — create a new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createTicketSchema.parse(body);

    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const categoryLabel: Record<string, string> = {
      FEATURE_REQUEST: "🆕 新機能リクエスト",
      BUG_REPORT: "🐛 バグ報告",
      IMPROVEMENT: "✨ 改善提案",
      OTHER: "📝 その他",
    };

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "TICKET",
          message: `${categoryLabel[data.category]}: ${data.title}`,
          link: `/dashboard/tickets`,
        })),
      });
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力内容を確認してください", details: error.flatten() }, { status: 400 });
    }
    return handleApiError(error);
  }
}
