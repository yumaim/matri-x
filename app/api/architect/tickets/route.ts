import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

// GET /api/admin/tickets — list all tickets
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateTicketSchema = z.object({
  ticketId: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  adminNote: z.string().max(2000).optional(),
});

// PUT /api/admin/tickets — update ticket status/note
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = updateTicketSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.adminNote !== undefined) updateData.adminNote = data.adminNote;

    const ticket = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: updateData,
      include: { user: { select: { id: true, name: true } } },
    });

    // Notify user about status change
    if (data.status || data.adminNote) {
      const statusLabel: Record<string, string> = {
        OPEN: "受付中", IN_PROGRESS: "対応中", RESOLVED: "解決済み", CLOSED: "クローズ",
      };
      const msg = data.adminNote
        ? `チケット「${ticket.title.slice(0, 20)}」に返信がありました`
        : `チケット「${ticket.title.slice(0, 20)}」のステータスが「${statusLabel[data.status!]}」に変更されました`;

      await createNotification({
        userId: ticket.userId,
        type: "TICKET",
        message: msg,
        link: "/dashboard/tickets",
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
