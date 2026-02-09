import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

// GET /api/notifications — 通知一覧
export async function GET() {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/notifications — 既読マーク
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
