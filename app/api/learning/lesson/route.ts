import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { buildLessons, cardsToDTO } from "@/lib/learning";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const levelId = req.nextUrl.searchParams.get("levelId");
  const lessonIndex = Number(req.nextUrl.searchParams.get("lessonIndex") ?? "1");
  if (!levelId) {
    return NextResponse.json({ error: "levelId обязателен" }, { status: 400 });
  }

  const level = await prisma.learningLevel.findUnique({
    where: { id: levelId },
    include: {
      levelSections: {
        orderBy: { order: "asc" },
        include: {
          section: {
            include: {
              cards: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!level) {
    return NextResponse.json({ error: "Уровень не найден" }, { status: 404 });
  }

  const cards = level.levelSections.flatMap((ls) =>
    ls.section.cards.map((card) => ({ ...card, sectionId: ls.section.id }))
  );
  const lessons = buildLessons(cards, 5);
  const safeLesson = Math.min(Math.max(lessonIndex, 1), Math.max(lessons.length, 1));
  const lessonCards = lessons[safeLesson - 1] ?? [];

  const progress = await prisma.userProgress.findMany({
    where: { userId: session!.userId, cardId: { in: lessonCards.map((card) => card.id) } },
    select: { cardId: true },
  });
  const learnedSet = new Set(progress.map((item) => item.cardId));

  return NextResponse.json({
    level: {
      id: level.id,
      name: level.title,
      nameKz: level.title,
      emoji: level.emoji,
      number: level.order,
    },
    lessonIndex: safeLesson,
    totalLessons: Math.max(1, lessons.length),
    cards: lessonCards.map((card) => cardsToDTO({ ...card, learned: learnedSet.has(card.id) })),
  });
}