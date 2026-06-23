import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const [learnedCount, testResults] = await Promise.all([
    prisma.userProgress.count({ where: { userId: session!.userId } }),
    prisma.testResult.findMany({ where: { userId: session!.userId } }),
  ]);

  return NextResponse.json({
    learnedWords: learnedCount,
    completedTests: testResults.length,
  });
}
