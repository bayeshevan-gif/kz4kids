import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { buildLessons, shuffle } from "@/lib/learning";
import type { CardDTO, TestQuestionDTO } from "@/lib/types";

function cardToDTO(c: { id: string; sectionId: string; ru: string; kz: string; emoji: string; imageUrl: string | null; gifUrl: string | null; audioRuUrl: string | null; audioKzUrl: string | null; order: number }): CardDTO {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;

  const levelId = req.nextUrl.searchParams.get("levelId");
  if (!levelId) {
    return NextResponse.json({ error: "levelId обязателен" }, { status: 400 });
  }

  const level = await prisma.learningLevel.findUnique({
    where: { id: levelId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!level) {
    return NextResponse.json({ error: "Уровень не найден" }, { status: 404 });
  }

  const cards = level.sections.flatMap((section) =>
    section.cards.map((card) => ({ ...card, sectionId: section.id }))
  );
  const lessonIndex = Number(req.nextUrl.searchParams.get("lessonIndex") ?? "0");
  const cumulative = Number(req.nextUrl.searchParams.get("cumulative") ?? "0");
  const isFinal = req.nextUrl.searchParams.get("final") === "1";
  const lessons = buildLessons(cards, 5);

  let pool = cards;
  if (isFinal) {
    pool = cards;
  } else if (lessonIndex > 0) {
    const safeLesson = Math.min(Math.max(lessonIndex, 1), Math.max(lessons.length, 1));
    pool = lessons[safeLesson - 1] ?? [];
  } else if (cumulative > 0) {
    pool = lessons.slice(0, Math.min(cumulative, lessons.length)).flat();
  } else {
    pool = lessons[0] ?? [];
  }

  if (cards.length < 2 || pool.length < 2) {
    return NextResponse.json(
      { error: "Недостаточно карточек для теста (нужно минимум 2 в выбранном уроке/наборе)" },
      { status: 400 }
    );
  }

  const shuffledCards = shuffle(pool);
  const selected = shuffledCards.slice(0, 6);
  const questions: TestQuestionDTO[] = selected.map((card) => {
    const distractors = shuffle(cards.filter((c) => c.id !== card.id)).slice(0, 3);
    const options = shuffle([card, ...distractors]).map(cardToDTO);
    return { card: cardToDTO(card), options };
  });

  return NextResponse.json({ questions });
}
