import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-guard";
import type { CardDTO } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId обязателен" }, { status: 400 });
  }

  const cards = await prisma.card.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
    include: {
      progress: {
        where: { userId: session!.userId },
        select: { id: true },
      },
    },
  });

  const result: CardDTO[] = cards.map((c) => ({
    id: c.id,
    sectionId: c.sectionId,
    ru: c.ru,
    kz: c.kz,
    emoji: c.emoji,
    imageUrl: c.imageUrl,
    gifUrl: c.gifUrl,
    order: c.order,
    learned: c.progress.length > 0,
  }));

  return NextResponse.json({ cards: result });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";
  const ru = typeof body?.ru === "string" ? body.ru.trim() : "";
  const kz = typeof body?.kz === "string" ? body.kz.trim() : "";
  const emoji = typeof body?.emoji === "string" ? body.emoji : "🃏";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : null;
  const gifUrl = typeof body?.gifUrl === "string" ? body.gifUrl : null;

  if (!sectionId || !ru || !kz) {
    return NextResponse.json(
      { error: "Раздел, слово на русском и казахском обязательны" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.card.aggregate({
    where: { sectionId },
    _max: { order: true },
  });

  const card = await prisma.card.create({
    data: {
      sectionId,
      ru,
      kz,
      emoji,
      imageUrl,
      gifUrl,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ card });
}
