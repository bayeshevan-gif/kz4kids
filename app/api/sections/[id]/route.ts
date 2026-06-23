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
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const nameKz = typeof body?.nameKz === "string" ? body.nameKz.trim() : undefined;
  const emoji = typeof body?.emoji === "string" ? body.emoji : undefined;

  const section = await prisma.section.update({
    where: { id },
    data: { name, nameKz, emoji },
  });

  return NextResponse.json({ section });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.section.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
