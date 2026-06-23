import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import type { CardDTO, TestQuestionDTO } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;

  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId обязателен" }, { status: 400 });
  }

  const cards = await prisma.card.findMany({ where: { sectionId } });

  if (cards.length < 2) {
    return NextResponse.json(
      { error: "Недостаточно карточек для теста (нужно минимум 2)" },
      { status: 400 }
    );
  }

  const toDTO = (c: (typeof cards)[number]): CardDTO => ({
    id: c.id,
    sectionId: c.sectionId,
    ru: c.ru,
    kz: c.kz,
    emoji: c.emoji,
    imageUrl: c.imageUrl,
    gifUrl: c.gifUrl,
    order: c.order,
    learned: false,
  });

  const shuffledCards = shuffle(cards);
  const questions: TestQuestionDTO[] = shuffledCards.map((card) => {
    const others = shuffle(cards.filter((c) => c.id !== card.id)).slice(0, 3);
    const options = shuffle([card, ...others]).map(toDTO);
    return { card: toDTO(card), options };
  });

  return NextResponse.json({ questions });
}
