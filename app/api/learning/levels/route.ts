import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { buildLessons } from "@/lib/learning";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const levels = await prisma.learningLevel.findMany({
    orderBy: { order: "asc" },
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

  const levelIds = levels.map((level) => level.id);
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session!.userId,
      cardId: {
        in: levels.flatMap((level) =>
          level.levelSections.flatMap((ls) => ls.section.cards.map((card) => card.id))
        ),
      },
    },
    select: { cardId: true },
  });
  const learnedSet = new Set(progress.map((p) => p.cardId));

  const finalTests = await prisma.testResult.findMany({
    where: { userId: session!.userId, levelId: { in: levelIds }, lessonIndex: 0 },
    select: { levelId: true },
  });
  const finalCompleted = new Set(finalTests.map((result) => result.levelId));

  const levelsResult = levels.map((level) => {
    const levelSections = level.levelSections || [];
    const sections = levelSections.map((ls) => {
      const s = ls.section;
      return {
        id: s.id,
        name: s.name,
        nameKz: s.nameKz,
        emoji: s.emoji,
        order: s.order,
        totalCards: s.cards.length,
        learnedCards: s.cards.filter((c) => learnedSet.has(c.id)).length,
      };
    });

    const cards = levelSections.flatMap((ls) =>
      ls.section.cards.map((card) => ({ ...card, sectionId: ls.section.id }))
    );
    const lessons = buildLessons(cards, 5);
    const learnedCards = cards.filter((card) => learnedSet.has(card.id)).length;
    const completedLessons = lessons.filter((lesson) => lesson.every((card) => learnedSet.has(card.id))).length;
    const prevLevel = levels.find((other) => other.order === level.order - 1);
    const unlocked = level.order === 1 || (prevLevel && finalCompleted.has(prevLevel.id));

    return {
      id: level.id,
      name: level.title,
      nameKz: level.description || "",
      emoji: level.emoji,
      number: level.order,
      order: level.order,
      totalCards: cards.length,
      learnedCards,
      totalLessons: Math.max(1, lessons.length),
      completedLessons,
      unlocked,
      finished: finalCompleted.has(level.id),
      sections,
    };
  });

  return NextResponse.json({ levels: levelsResult });
}
