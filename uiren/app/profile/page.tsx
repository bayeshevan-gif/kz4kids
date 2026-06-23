"use client";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import type { SectionDTO } from "@/lib/types";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function ProfilePage() {
  const { data: stats } = useSWR("/api/progress/stats", fetcher);
  const { data: sectionsData } = useSWR<{ sections: SectionDTO[] }>("/api/sections", fetcher);
  const sections = sectionsData?.sections ?? [];

  return (
    <>
      <AppHeader />
      <main className="px-[18px]">
        <h1 className="text-[26px] font-extrabold mb-3">Мой прогресс 🏆</h1>
        <div className="flex gap-2.5 mb-4">
          <div className="flex-1 bg-[var(--card)] card-shadow rounded-2xl p-3 text-center">
            <div className="text-[22px] font-extrabold text-[var(--accent-dark)]">{stats?.learnedWords ?? 0}</div>
            <div className="text-[11px] text-[var(--ink-soft)] font-bold">слов выучено</div>
          </div>
          <div className="flex-1 bg-[var(--card)] card-shadow rounded-2xl p-3 text-center">
            <div className="text-[22px] font-extrabold text-[var(--accent-dark)]">{stats?.completedTests ?? 0}</div>
            <div className="text-[11px] text-[var(--ink-soft)] font-bold">тестов пройдено</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {sections.map((s: SectionDTO) => {
            const pct = s.totalCards > 0 ? Math.round((s.learnedCards / s.totalCards) * 100) : 0;
            return (
              <div key={s.id} className="bg-[var(--card)] card-shadow rounded-[22px] p-3.5 flex gap-3.5">
                <div className="h-16 w-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-3xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="font-extrabold">{s.name}</div>
                  <div className="h-2 rounded-lg bg-[var(--line)] mt-2 overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-lg" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] mt-1">{s.learnedCards} из {s.totalCards} слов</div>
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
