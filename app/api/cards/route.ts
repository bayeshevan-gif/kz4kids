import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-guard";

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

  const result = cards.map((card) => ({
    id: card.id,
    sectionId: card.sectionId,
    ru: card.ru,
    kz: card.kz,
    emoji: card.emoji,
    imageUrl: card.imageUrl,
    gifUrl: card.gifUrl,
    audioRuUrl: card.audioRuUrl,
    audioKzUrl: card.audioKzUrl,
    audioUrl: card.audioUrl,
    audioFileName: card.audioFileName,
    audioDuration: card.audioDuration,
    order: card.order,
    learned: card.progress.length > 0,
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
  const audioRuUrl = typeof body?.audioRuUrl === "string" ? body.audioRuUrl : null;
  const audioKzUrl = typeof body?.audioKzUrl === "string" ? body.audioKzUrl : null;
  const audioUrl = typeof body?.audioUrl === "string" ? body.audioUrl : null;
  const audioFileName = typeof body?.audioFileName === "string" ? body.audioFileName : null;
  const audioDuration = typeof body?.audioDuration === "number" ? body.audioDuration : null;

  if (!sectionId || !ru || !kz) {
    return NextResponse.json({ error: "sectionId, ru и kz обязательны" }, { status: 400 });
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
      audioRuUrl,
      audioKzUrl,
      audioUrl,
      audioFileName,
      audioDuration,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ card });
}