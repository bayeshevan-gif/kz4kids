import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Имя должно быть не короче 2 символов" },
      { status: 400 }
    );
  }
  if (!password || password.length < 4) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 4 символов" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: "Это имя уже занято, выбери другое" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, passwordHash, role: "CHILD" },
  });

  await createSession({ userId: user.id, name: user.name, role: user.role });

  return NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role },
  });
}
