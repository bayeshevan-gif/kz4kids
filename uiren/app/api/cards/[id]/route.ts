import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const ru = typeof body?.ru === "string" ? body.ru.trim() : undefined;
  const kz = typeof body?.kz === "string" ? body.kz.trim() : undefined;
  const emoji = typeof body?.emoji === "string" ? body.emoji : undefined;
  const imageUrl =
    body?.imageUrl === null ? null : typeof body?.imageUrl === "string" ? body.imageUrl : undefined;
  const gifUrl =
    body?.gifUrl === null ? null : typeof body?.gifUrl === "string" ? body.gifUrl : undefined;

  const card = await prisma.card.update({
    where: { id },
    data: { ru, kz, emoji, imageUrl, gifUrl },
  });

  return NextResponse.json({ card });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.card.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
