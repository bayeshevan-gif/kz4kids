import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const requestedCardIds = Array.from(
    new Set<string>(
      Array.isArray(body?.cardIds)
        ? body.cardIds.filter((id: unknown): id is string => typeof id === "string")
        : []
    )
  );

  if (requestedCardIds.length === 0) {
    return NextResponse.json({ error: "cardIds are required" }, { status: 400 });
  }

  const cards = await prisma.card.findMany({
    where: { id: { in: requestedCardIds } },
    select: { id: true },
  });
  const cardIds = cards.map((card) => card.id);

  if (cardIds.length === 0) {
    return NextResponse.json({ error: "Cards not found" }, { status: 404 });
  }

  await Promise.all(
    cardIds.map((cardId) =>
      prisma.userProgress.upsert({
        where: { userId_cardId: { userId: session!.userId, cardId } },
        update: {},
        create: { userId: session!.userId, cardId },
      })
    )
  );

  return NextResponse.json({ ok: true, added: cardIds.length });
}
