import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const [learnedCount, testResults, sections] = await Promise.all([
    prisma.userProgress.count({ where: { userId: session!.userId } }),
    prisma.testResult.findMany({
      where: { userId: session!.userId },
      orderBy: { completedAt: "desc" },
    }),
    prisma.section.findMany({
      select: { id: true, name: true, emoji: true },
    }),
  ]);

  const sectionMap = new Map(sections.map((s) => [s.id, s]));

  const recentTests = testResults.slice(0, 10).map((t) => {
    const sec = sectionMap.get(t.sectionId);
    return {
      id: t.id,
      sectionName: sec?.name ?? "Раздел",
      sectionEmoji: sec?.emoji ?? "📝",
      correctCount: t.correctCount,
      totalCount: t.totalCount,
      completedAt: t.completedAt,
    };
  });

  let averageScore = 0;
  if (testResults.length > 0) {
    const totalCorrect = testResults.reduce((acc, r) => acc + r.correctCount, 0);
    const totalQuestions = testResults.reduce((acc, r) => acc + r.totalCount, 0);
    averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  }

  return NextResponse.json({
    learnedWords: learnedCount,
    completedTests: testResults.length,
    averageScore,
    recentTests,
  });
}
