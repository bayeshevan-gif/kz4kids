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

  const cards = await prisma.card.findMany({ where: { sectionId }, orderBy: { order: 'asc' } });

  // Lesson parameters
  const lessonIndex = req.nextUrl.searchParams.get("lessonIndex"); // 1-based
  const cumulative = Number(req.nextUrl.searchParams.get("cumulative")) || 0; // number of lessons to include
  const CARDS_PER_LESSON = 6;

  let pool = cards;
  if (lessonIndex) {
    const li = Math.max(1, Number(lessonIndex));
    const start = (li - 1) * CARDS_PER_LESSON;
    pool = cards.slice(start, start + CARDS_PER_LESSON);
  } else if (cumulative > 0) {
    const upto = Math.max(1, cumulative) * CARDS_PER_LESSON;
    pool = cards.slice(0, upto);
  }

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
    audioRuUrl: c.audioRuUrl,
    audioKzUrl: c.audioKzUrl,
    order: c.order,
    learned: false,
  });

  const shuffledCards = shuffle(pool);
  // Limit test size to 6 questions (as requested)
  const selected = shuffledCards.slice(0, 6);
  const questions: TestQuestionDTO[] = selected.map((card) => {
    const others = shuffle(pool.filter((c) => c.id !== card.id)).slice(0, 3);
    const options = shuffle([card, ...others]).map(toDTO);
    return { card: toDTO(card), options };
  });

  return NextResponse.json({ questions });
}
