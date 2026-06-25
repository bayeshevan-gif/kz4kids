import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const cardIds = Array.isArray(body?.cardIds) ? body.cardIds.filter((id: any) => typeof id === 'string') : [];
  if (cardIds.length === 0) {
    return NextResponse.json({ error: 'cardIds обязательны' }, { status: 400 });
  }

  const tasks = cardIds.map((cardId: string) =>
    prisma.userProgress.upsert({
      where: { userId_cardId: { userId: session!.userId, cardId } },
      update: {},
      create: { userId: session!.userId, cardId },
    })
  );

  await Promise.all(tasks);

  return NextResponse.json({ ok: true, added: cardIds.length });
}
