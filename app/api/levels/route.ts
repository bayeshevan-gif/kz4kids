import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const levels = await prisma.learningLevel.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      levelSections: {
        orderBy: { order: "asc" },
        include: {
          section: {
            include: {
              cards: {
                orderBy: { order: "asc" },
                select: { id: true },
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
      userId: (await requireUser()).session!.userId,
      cardId: { 
        in: levels.flatMap((level) => 
          level.levelSections.flatMap((ls) => ls.section.cards.map((card) => card.id))
        ) 
      },
    },
    select: { cardId: true },
  });
  const learnedSet = new Set(progress.map((p) => p.cardId));

  const finalTests = await prisma.testResult.findMany({
    where: { 
      userId: (await requireUser()).session!.userId, 
      levelId: { in: levelIds }, 
      lessonIndex: 0 
    },
    select: { levelId: true },
  });
  const finalCompleted = new Set(finalTests.map((result) => result.levelId));

  const levelsResult = levels.map((level) => {
    const allCards = level.levelSections.flatMap((ls) => 
      ls.section.cards.map((card) => ({ ...card, sectionId: ls.section.id }))
    );
    const learnedCards = allCards.filter((card) => learnedSet.has(card.id)).length;
    const finished = finalCompleted.has(level.id);

    return {
      id: level.id,
      title: level.title,
      description: level.description,
      emoji: level.emoji,
      order: level.order,
      isPublished: level.isPublished,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt?.toISOString() ?? null,
      totalCards: allCards.length,
      learnedCards,
      totalLessons: Math.max(1, Math.ceil(allCards.length / 5)),
      completedLessons: finished ? Math.ceil(allCards.length / 5) : 0,
      unlocked: true,
      finished,
    };
  });

  return NextResponse.json({ levels: levelsResult });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : null;
  const emoji = typeof body?.emoji === "string" ? body.emoji : "🎯";
  const order = typeof body?.order === "number" ? body.order : 0;
  const isPublished = typeof body?.isPublished === "boolean" ? body.isPublished : true;

  if (!title) {
    return NextResponse.json({ error: "Название уровня обязательно" }, { status: 400 });
  }

  const maxOrder = await prisma.learningLevel.aggregate({ _max: { order: true } });
  const level = await prisma.learningLevel.create({
    data: {
      title,
      description,
      emoji,
      order: order || (maxOrder._max.order ?? 0) + 1,
      isPublished,
    },
  });

  return NextResponse.json({ 
    level: {
      id: level.id,
      title: level.title,
      description: level.description,
      emoji: level.emoji,
      order: level.order,
      isPublished: level.isPublished,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt?.toISOString() ?? null,
    }
  });
}