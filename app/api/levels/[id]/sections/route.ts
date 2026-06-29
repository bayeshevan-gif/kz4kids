import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const levelSections = await prisma.levelSection.findMany({
    where: { levelId: id },
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
  });

  const result = levelSections.map((ls) => ({
    id: ls.section.id,
    name: ls.section.name,
    nameKz: ls.section.nameKz,
    emoji: ls.section.emoji,
    order: ls.order,
    totalCards: ls.section.cards.length,
    learnedCards: 0,
  }));

  return NextResponse.json({ sections: result });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";

  if (!sectionId) {
    return NextResponse.json({ error: "sectionId обязателен" }, { status: 400 });
  }

  const maxOrder = await prisma.levelSection.aggregate({
    where: { levelId: id },
    _max: { order: true },
  });

  await prisma.levelSection.create({
    data: {
      levelId: id,
      sectionId,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";

  if (!sectionId) {
    return NextResponse.json({ error: "sectionId обязателен" }, { status: 400 });
  }

  await prisma.levelSection.delete({
    where: {
      levelId_sectionId: {
        levelId: id,
        sectionId,
      },
    },
  });

  return NextResponse.json({ ok: true });
}