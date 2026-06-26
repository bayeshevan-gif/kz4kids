"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import type { SectionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getWordPlural(count: number) {
  const remainder10 = count % 10;
  const remainder100 = count % 100;
  if (remainder10 === 1 && remainder100 !== 11) {
    return "слово";
  }
  if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 12 || remainder100 > 14)) {
    return "слова";
  }
  return "слов";
}

export default function TestsHomePage() {
  const router = useRouter();
  const { data } = useSWR<{ sections: SectionDTO[] }>("/api/sections", fetcher);
  const sections = data?.sections ?? [];

  return (
    <>
      <AppHeader />
      <main className="px-[18px]">
        <h1 className="text-[26px] font-extrabold mb-1">Тесты 📝</h1>
        <p className="text-[var(--ink-soft)] text-[15px] mb-[18px]">
          Выбери раздел, чтобы проверить себя
        </p>
        <div className="grid grid-cols-2 gap-[14px]">
          {sections.map((s: SectionDTO) => {
            const perLesson = s.cardsPerLesson ?? 6;
            const totalLessons = Math.max(1, Math.ceil(s.totalCards / perLesson));
            const completionText = `${s.totalCards} ${getWordPlural(s.totalCards)}`;

            return (
              <div
                key={s.id}
                className="rounded-[22px] bg-[var(--card)] card-shadow p-[18px_14px] text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[40px]">{s.emoji}</span>
                  <span className="text-[12px] text-[var(--ink-soft)] font-semibold">{completionText}</span>
                </div>
                <div className="font-extrabold text-[16px] mb-3">{s.name}</div>
                <div className="grid gap-2">
                      {Array.from({ length: Math.min(totalLessons, 3) }, (_, idx) => {
                        const lessonCardCount = Math.min(perLesson, Math.max(0, s.totalCards - idx * perLesson));
                        const disabled = lessonCardCount < 2;
                        return (
                          <button
                            key={idx}
                            disabled={disabled}
                            onClick={() => router.push(`/test/${s.id}?lessonIndex=${idx + 1}`)}
                            className="rounded-[18px] border-2 border-[var(--line)] bg-white py-3 text-[13px] font-bold text-[var(--ink)] disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                          >
                            Тест урока {idx + 1}
                          </button>
                        );
                      })}
                      {totalLessons >= 3 && (
                        <button
                          disabled={s.totalCards < 2}
                          onClick={() => router.push(`/test/${s.id}?cumulative=3`)}
                          className="rounded-[18px] bg-[var(--good)] text-white py-3 text-[13px] font-bold disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                        >
                          Тест 3 уроков
                        </button>
                      )}
                      {s.totalCards < 2 ? (
                        <div className="text-[11px] text-[var(--bad)]">Нужно хотя бы 2 карточки для теста</div>
                      ) : totalLessons > 3 ? (
                        <div className="text-[11px] text-[var(--ink-soft)]">Всего уроков: {totalLessons}.</div>
                      ) : null}
                    </div>
              </div>
            );
          })}
        </div>
      </main>
      <TabBar />
    </>
  );
}
