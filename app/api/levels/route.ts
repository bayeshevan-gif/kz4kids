import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const levels = await prisma.learningLevel.findMany({
    orderBy: [{ number: "asc" }, { order: "asc" }],
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json({ levels });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const nameKz = typeof body?.nameKz === "string" ? body.nameKz.trim() : "";
  const emoji = typeof body?.emoji === "string" ? body.emoji : "🎯";
  const number = Number.isFinite(Number(body?.number)) ? Number(body.number) : 1;

  if (!name) {
    return NextResponse.json({ error: "Название уровня обязательно" }, { status: 400 });
  }

  const maxOrder = await prisma.learningLevel.aggregate({ _max: { order: true } });
  const level = await prisma.learningLevel.create({
    data: {
      name,
      nameKz,
      emoji,
      number,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ level });
}
