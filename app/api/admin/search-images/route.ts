import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const query = req.nextUrl.searchParams.get("q") || "";
  const paramKey = req.nextUrl.searchParams.get("key") || "";
  const key = paramKey || process.env.PIXABAY_API_KEY || "";

  if (!key) {
    return NextResponse.json(
      { error: "api_key_missing", message: "Pixabay API Key не найден. Пожалуйста, укажите его в настройках или в .env файле." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=illustration&lang=ru&per_page=24`
    );
    const data = await res.json();

    if (data.error || !res.ok) {
      return NextResponse.json(
        { error: "pixabay_api_error", message: data.message || "Ошибка запроса к Pixabay API" },
        { status: 500 }
      );
    }

    const images = (data.hits || []).map((hit: any) => ({
      id: hit.id,
      previewUrl: hit.previewURL,
      webformatUrl: hit.webformatURL,
      largeImageUrl: hit.largeImageURL,
    }));

    return NextResponse.json({ images });
  } catch (err: any) {
    return NextResponse.json(
      { error: "server_error", message: err.message || "Ошибка сервера при поиске картинок" },
      { status: 500 }
    );
  }
}
