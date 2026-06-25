"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { useUser } from "@/lib/user-context";
import type { SectionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { data, isLoading } = useSWR<{ sections: SectionDTO[] }>(
    user ? "/api/sections" : null,
    fetcher
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px]">
          <p className="text-[var(--ink-soft)] text-sm">Загрузка...</p>
        </main>
      </>
    );
  }

  const sections = data?.sections ?? [];

  return (
    <>
      <AppHeader />
      <main className="px-[18px]">
        <h1 className="text-[26px] font-extrabold mt-2 mb-1">Сәлем, {user.name}! 👋</h1>
        <p className="text-[var(--ink-soft)] text-[15px] mb-[18px]">
          Выбери раздел и начни учить слова
        </p>

        {isLoading ? (
          <p className="text-[var(--ink-soft)] text-sm">Загрузка разделов...</p>
        ) : sections.length === 0 ? (
          <div className="text-center py-[50px] text-[var(--ink-soft)]">
            <span className="text-[50px] block mb-2">🗂️</span>
            Разделов пока нет
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[14px]">
            {sections.map((s: SectionDTO) => (
            <button
              key={s.id}
              onClick={() => router.push(`/learn/${s.id}`)}
              className="relative kid-section-card card-shadow active:scale-95 transition-transform"
            >
              {s.totalCards > 0 && (
                <span className="absolute top-3 right-3 sticker-badge">
                  {s.learnedCards}/{s.totalCards}
                </span>
              )}
              <span className="playful-emoji">{s.emoji}</span>
              <div className="font-extrabold text-[16px]">{s.name}</div>
              <div className="text-[13px] text-[var(--ink-soft)] font-semibold">{s.nameKz}</div>
            </button>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
