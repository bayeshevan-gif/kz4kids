import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { buildLessons } from "@/lib/learning";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const [learnedCount, testResults, levels] = await Promise.all([
    prisma.userProgress.count({ where: { userId: session!.userId } }),
    prisma.testResult.findMany({
      where: { userId: session!.userId },
      orderBy: { completedAt: "desc" },
    }),
    prisma.learningLevel.findMany({
      orderBy: [{ number: "asc" }, { order: "asc" }],
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
              select: { id: true },
            },
          },
        },
      },
    }),
  ]);

  const levelsProgress = levels.map((level) => {
    const cards = level.sections.flatMap((section) => section.cards.map((card) => ({ ...card, sectionId: section.id })));
    const lessons = buildLessons(cards, 5);
    const levelProgress = {
      id: level.id,
      name: level.name,
      nameKz: level.nameKz,
      emoji: level.emoji,
      number: level.number,
      totalCards: cards.length,
      totalLessons: Math.max(1, lessons.length),
      completedLessons: lessons.filter((lesson) =>
        lesson.every((card) => testResults.some((test) => test.levelId === level.id && test.lessonIndex === 0))
      ).length,
    };
    return levelProgress;
  });

  const recentTests = testResults.slice(0, 10).map((t) => {
    const level = levels.find((l) => l.id === t.levelId);
    return {
      id: t.id,
      levelName: level?.name ?? "Уровень",
      levelEmoji: level?.emoji ?? "📝",
      lessonIndex: t.lessonIndex,
      correctCount: t.correctCount,
      totalCount: t.totalCount,
      completedAt: t.completedAt,
    };
  });

  const totalQuestions = testResults.reduce((acc, r) => acc + r.totalCount, 0);
  const totalCorrect = testResults.reduce((acc, r) => acc + r.correctCount, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return NextResponse.json({
    learnedWords: learnedCount,
    completedTests: testResults.length,
    averageScore,
    recentTests,
    levels: levelsProgress,
  });
}
