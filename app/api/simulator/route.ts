import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const simulationSchema = z.object({
  inputs: z.record(z.unknown()),
  result: z.number(),
});

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = simulationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "inputs（オブジェクト）と result（数値）が必要です" },
        { status: 400 }
      );
    }

    const simulation = await prisma.simulation.create({
      data: {
        userId: session.user.id,
        inputs: JSON.stringify(parsed.data.inputs),
        result: parsed.data.result,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireAuth();

    const simulations = await prisma.simulation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(simulations);
  } catch (error) {
    return handleApiError(error);
  }
}
