"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { speak } from "@/lib/useSpeech";
import type { CardDTO, SectionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LearnSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();

  const { data: sectionsData } = useSWR<{ sections: SectionDTO[] }>("/api/sections", fetcher);
  const { data: cardsData, mutate } = useSWR<{ cards: CardDTO[] }>(
    `/api/cards?sectionId=${sectionId}`,
    fetcher
  );

  const section = sectionsData?.sections.find((s) => s.id === sectionId);
  const cards = cardsData?.cards ?? [];

  async function toggleLearned(cardId: string) {
    await fetch("/api/progress/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    mutate();
  }

  return (
    <>
      <AppHeader />
      <main className="px-[18px]">
        <div className="flex items-center gap-2.5 mb-3.5">
          <button
            onClick={() => router.push("/")}
            className="h-[38px] w-[38px] rounded-[12px] bg-[var(--card)] card-shadow text-[var(--accent-dark)] flex items-center justify-center"
          >
            ←
          </button>
          <div>
            <h1 className="text-[22px] font-extrabold">
              {section ? `${section.emoji} ${section.name}` : "Загрузка..."}
            </h1>
            <p className="text-[var(--ink-soft)] text-[13px]">{section?.nameKz}</p>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-[50px] text-[var(--ink-soft)]">
            <span className="text-[50px] block mb-2">🗂️</span>
            В этом разделе пока нет карточек
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map((c: CardDTO) => (
              <div key={c.id} className="bg-[var(--card)] card-shadow rounded-[22px] p-3.5 flex gap-3.5 items-center">
                <div className="h-16 w-16 rounded-[16px] bg-[var(--accent-soft)] flex items-center justify-center text-[30px] overflow-hidden flex-shrink-0">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.ru} className="h-full w-full object-cover" />
                  ) : (
                    c.emoji
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[17px]">
                    {c.ru}{" "}
                    <button onClick={() => speak(c.ru, "ru")} className="ml-1 rounded-[10px] bg-[var(--accent-soft)] px-2 py-1 text-xs">
                      🔊
                    </button>
                  </div>
                  <div className="text-[var(--accent-dark)] font-bold text-[15px]">
                    {c.kz}{" "}
                    <button onClick={() => speak(c.kz, "kz")} className="ml-1 rounded-[10px] bg-[var(--accent-soft)] px-2 py-1 text-xs">
                      🔊
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => toggleLearned(c.id)}
                  className="h-[38px] w-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: c.learned ? "var(--good-soft)" : "var(--accent-soft)" }}
                >
                  {c.learned ? "✅" : "⭐"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
