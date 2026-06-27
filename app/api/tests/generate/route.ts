import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { buildLessons, shuffle } from "@/lib/learning";
import type { CardDTO, TestQuestionDTO } from "@/lib/types";

type TestCard = {
  id: string;
  sectionId: string;
  ru: string;
  kz: string;
  emoji: string;
  imageUrl: string | null;
  gifUrl: string | null;
  audioRuUrl: string | null;
  audioKzUrl: string | null;
  order: number;
};

function cardToDTO(card: TestCard): CardDTO {
  return {
    id: card.id,
    sectionId: card.sectionId,
    ru: card.ru,
    kz: card.kz,
    emoji: card.emoji,
    imageUrl: card.imageUrl,
    gifUrl: card.gifUrl,
    audioRuUrl: card.audioRuUrl,
    audioKzUrl: card.audioKzUrl,
    order: card.order,
    learned: false,
  };
}

function chunkCards<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildQuestions(allCards: TestCard[], pool: TestCard[]): TestQuestionDTO[] | NextResponse {
  if (allCards.length < 2 || pool.length < 2) {
    return NextResponse.json(
      { error: "Not enough cards for a test: at least 2 cards are required in the selected set" },
      { status: 400 }
    );
  }

  return shuffle(pool).slice(0, 6).map((card) => {
    const distractors = shuffle(allCards.filter((candidate) => candidate.id !== card.id)).slice(0, 3);
    const options = shuffle([card, ...distractors]).map(cardToDTO);
    return { card: cardToDTO(card), options };
  });
}

export async function GET(req: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;

  const levelId = req.nextUrl.searchParams.get("levelId");
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const lessonIndex = Number(req.nextUrl.searchParams.get("lessonIndex") ?? "0");
  const cumulative = Number(req.nextUrl.searchParams.get("cumulative") ?? "0");
  const isFinal = req.nextUrl.searchParams.get("final") === "1";

  if (!levelId && !sectionId) {
    return NextResponse.json({ error: "levelId or sectionId is required" }, { status: 400 });
  }

  if (levelId) {
    const level = await prisma.learningLevel.findUnique({
      where: { id: levelId },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: { cards: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const cards: TestCard[] = level.sections.flatMap((section) =>
      section.cards.map((card) => ({ ...card, sectionId: section.id }))
    );
    const lessons = buildLessons(cards, 5);
    let pool = cards;

    if (!isFinal && lessonIndex > 0) {
      const safeLesson = Math.min(Math.max(lessonIndex, 1), Math.max(lessons.length, 1));
      pool = lessons[safeLesson - 1] ?? [];
    } else if (!isFinal && cumulative > 0) {
      pool = lessons.slice(0, Math.min(cumulative, lessons.length)).flat();
    } else if (!isFinal) {
      pool = lessons[0] ?? [];
    }

    const questions = buildQuestions(cards, pool);
    if (questions instanceof NextResponse) return questions;
    return NextResponse.json({ questions });
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId! },
    include: { cards: { orderBy: { order: "asc" } } },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const cards: TestCard[] = section.cards.map((card) => ({ ...card, sectionId: section.id }));
  const lessons = chunkCards(cards, 6);
  let pool = lessons[0] ?? [];

  if (lessonIndex > 0) {
    const safeLesson = Math.min(Math.max(lessonIndex, 1), Math.max(lessons.length, 1));
    pool = lessons[safeLesson - 1] ?? [];
  } else if (cumulative > 0) {
    pool = lessons.slice(0, Math.min(cumulative, lessons.length)).flat();
  }

  const questions = buildQuestions(cards, pool);
  if (questions instanceof NextResponse) return questions;
  return NextResponse.json({ questions });
}
