import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const levelId = typeof body?.levelId === "string" ? body.levelId : "";
  const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";
  const lessonIndex = Number.isInteger(Number(body?.lessonIndex)) ? Number(body.lessonIndex) : 0;
  const correctCount = Number(body?.correctCount);
  const totalCount = Number(body?.totalCount);

  if (
    (!levelId && !sectionId) ||
    !Number.isInteger(correctCount) ||
    !Number.isInteger(totalCount) ||
    totalCount <= 0 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) {
    return NextResponse.json({ error: "Invalid test result data" }, { status: 400 });
  }

  let targetLevelId: string | null = null;
  let validCardIds = new Set<string>();

  if (sectionId) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { levelId: true, cards: { select: { id: true } } },
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    targetLevelId = section.levelId;
    validCardIds = new Set(section.cards.map((card) => card.id));
  } else {
    const level = await prisma.learningLevel.findUnique({
      where: { id: levelId },
      select: {
        id: true,
        sections: { select: { cards: { select: { id: true } } } },
      },
    });
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }
    targetLevelId = level.id;
    validCardIds = new Set(level.sections.flatMap((section) => section.cards.map((card) => card.id)));
  }

  const result = await prisma.testResult.create({
    data: {
      userId: session!.userId,
      levelId: targetLevelId,
      lessonIndex: lessonIndex > 0 ? lessonIndex : 0,
      correctCount,
      totalCount,
    },
  });

  const correctCardIds = Array.from(
    new Set<string>(
      Array.isArray(body?.correctCardIds)
        ? body.correctCardIds.filter((id: unknown): id is string => typeof id === "string")
        : []
    )
  ).filter((id) => validCardIds.has(id));

  if (correctCardIds.length > 0) {
    await Promise.all(
      correctCardIds.map((cardId) =>
        prisma.userProgress.upsert({
          where: { userId_cardId: { userId: session!.userId, cardId } },
          update: {},
          create: { userId: session!.userId, cardId },
        })
      )
    );
  }

  return NextResponse.json({ result });
}
