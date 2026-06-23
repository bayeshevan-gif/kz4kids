import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-guard";
import type { SectionDTO } from "@/lib/types";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    include: {
      cards: {
        select: {
          id: true,
          progress: {
            where: { userId: session!.userId },
            select: { id: true },
          },
        },
      },
    },
  });

  const result: SectionDTO[] = sections.map((s) => ({
    id: s.id,
    name: s.name,
    nameKz: s.nameKz,
    emoji: s.emoji,
    order: s.order,
    totalCards: s.cards.length,
    learnedCards: s.cards.filter((c) => c.progress.length > 0).length,
  }));

  return NextResponse.json({ sections: result });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const nameKz = typeof body?.nameKz === "string" ? body.nameKz.trim() : "";
  const emoji = typeof body?.emoji === "string" ? body.emoji : "📁";

  if (!name) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const maxOrder = await prisma.section.aggregate({ _max: { order: true } });
  const section = await prisma.section.create({
    data: {
      name,
      nameKz,
      emoji,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ section });
}
