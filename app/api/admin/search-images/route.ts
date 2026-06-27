import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

type PixabayHit = {
  id: number;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
};

type PixabayResponse = {
  error?: string;
  message?: string;
  hits?: PixabayHit[];
};

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const query = req.nextUrl.searchParams.get("q") || "";
  const paramKey = req.nextUrl.searchParams.get("key") || "";
  const key = paramKey || process.env.PIXABAY_API_KEY || "";

  if (!key) {
    return NextResponse.json(
      { error: "api_key_missing", message: "Pixabay API Key not found. Add it in settings or .env." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=illustration&lang=ru&per_page=24`
    );
    const data = (await res.json()) as PixabayResponse;

    if (data.error || !res.ok) {
      return NextResponse.json(
        { error: "pixabay_api_error", message: data.message || "Pixabay API request failed" },
        { status: 500 }
      );
    }

    const images = (data.hits || []).map((hit) => ({
      id: hit.id,
      previewUrl: hit.previewURL,
      webformatUrl: hit.webformatURL,
      largeImageUrl: hit.largeImageURL,
    }));

    return NextResponse.json({ images });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error while searching images";
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
