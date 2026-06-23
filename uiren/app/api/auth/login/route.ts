import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !password) {
    return NextResponse.json(
      { error: "Введите имя и пароль" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({ where: { name } });
  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Неверный пароль" },
      { status: 401 }
    );
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });

  return NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role },
  });
}
