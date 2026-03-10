import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { inputs, result } = body;

    if (!inputs || typeof result !== "number") {
      return NextResponse.json(
        { error: "Invalid request: inputs and result are required" },
        { status: 400 }
      );
    }

    const simulation = await prisma.simulation.create({
      data: {
        userId: session.user.id,
        inputs: JSON.stringify(inputs),
        result,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error("Failed to save simulation:", error);
    return NextResponse.json(
      { error: "Failed to save simulation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const simulations = await prisma.simulation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error("Failed to fetch simulations:", error);
    return NextResponse.json(
      { error: "Failed to fetch simulations" },
      { status: 500 }
    );
  }
}
