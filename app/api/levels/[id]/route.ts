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
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  const emoji = typeof body?.emoji === "string" ? body.emoji : undefined;
  const order = typeof body?.order === "number" ? body.order : undefined;
  const isPublished = typeof body?.isPublished === "boolean" ? body.isPublished : undefined;

  const level = await prisma.learningLevel.update({
    where: { id },
    data: {
      title,
      description,
      emoji,
      order,
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.learningLevel.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}