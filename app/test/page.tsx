"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import type { SectionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
          {sections.map((s: SectionDTO) => (
            <button
              key={s.id}
              disabled={s.totalCards < 2}
              onClick={() => router.push(`/test/${s.id}`)}
              className="rounded-[22px] bg-[var(--card)] card-shadow p-[18px_14px] text-center disabled:opacity-50"
            >
              <span className="block text-[40px] mb-1.5">{s.emoji}</span>
              <div className="font-extrabold text-[16px]">{s.name}</div>
              <div className="text-[12px] text-[var(--ink-soft)] font-semibold">
                {s.totalCards} {s.totalCards === 1 ? "слово" : "слов"}
              </div>
            </button>
          ))}
        </div>
      </main>
      <TabBar />
    </>
  );
}
