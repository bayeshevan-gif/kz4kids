import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const levelId = typeof body?.levelId === "string" ? body.levelId : "";
  const lessonIndex = Number.isFinite(Number(body?.lessonIndex)) ? Number(body.lessonIndex) : 0;
  const correctCount = Number(body?.correctCount);
  const totalCount = Number(body?.totalCount);

  if (!levelId || !Number.isFinite(correctCount) || !Number.isFinite(totalCount)) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const result = await prisma.testResult.create({
    data: {
      userId: session!.userId,
      levelId,
      lessonIndex: lessonIndex > 0 ? lessonIndex : 0,
      correctCount,
      totalCount,
    },
  });

  const correctCardIds = Array.isArray(body?.correctCardIds)
    ? body?.correctCardIds.filter((id: any) => typeof id === "string")
    : [];

  if (correctCardIds.length > 0) {
    const tasks = correctCardIds.map((cardId: string) =>
      prisma.userProgress.upsert({
        where: { userId_cardId: { userId: session!.userId, cardId } },
        update: {},
        create: { userId: session!.userId, cardId },
      })
    );
    await Promise.all(tasks);
  }

  return NextResponse.json({ result });
}
