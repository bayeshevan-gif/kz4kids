import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : "";
  if (!cardId) {
    return NextResponse.json({ error: "cardId обязателен" }, { status: 400 });
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_cardId: { userId: session!.userId, cardId } },
  });

  if (existing) {
    await prisma.userProgress.delete({ where: { id: existing.id } });
    return NextResponse.json({ learned: false });
  } else {
    await prisma.userProgress.create({
      data: { userId: session!.userId, cardId },
    });
    return NextResponse.json({ learned: true });
  }
}
