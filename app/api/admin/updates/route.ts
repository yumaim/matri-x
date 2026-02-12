import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notifyAlgorithmUpdate } from "@/lib/notifications";

const createUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  source: z.string().max(500).optional(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.string().max(100).optional(),
});

// POST /api/admin/updates — create algorithm update + notify all users
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = createUpdateSchema.parse(body);

    const update = await prisma.algorithmUpdate.create({
      data: {
        title: data.title,
        description: data.description,
        source: data.source ?? "",
        impact: data.impact,
        category: data.category ?? "一般",
        publishedAt: new Date(),
      },
    });

    // Notify all users (batched)
    notifyAlgorithmUpdate({
      title: update.title,
      impact: update.impact,
      updateId: update.id,
    }).catch(console.error);

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
