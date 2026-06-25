import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth-guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ (для аудио)
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "audio/mpeg",   // .mp3
  "audio/ogg",    // .ogg
  "audio/wav",    // .wav
  "audio/mp4",    // .m4a
];

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Допустимы PNG/JPEG/WEBP/GIF и аудио (mp3, wav, ogg, m4a)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Файл слишком большой (максимум ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} МБ)` },
      { status: 400 }
    );
  }

  const blob = await put(`cards/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
