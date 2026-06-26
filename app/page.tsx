"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import LearningPath from "@/components/LearningPath";
import { useUser } from "@/lib/user-context";
import type { LevelDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { data, isLoading } = useSWR<{ levels: LevelDTO[] }>(user ? "/api/learning/levels" : null, fetcher);

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

  const levels = data?.levels ?? [];

  return (
    <>
      <AppHeader />
      <main className="px-[18px]">
        <h1 className="text-[26px] font-extrabold mt-2 mb-1">Сәлем, {user.name}! 👋</h1>
        <p className="text-[var(--ink-soft)] text-[15px] mb-[18px]">
          Продолжай путь обучения: выбирай уровень и начинай уроки.
        </p>

        {isLoading ? (
          <p className="text-[var(--ink-soft)] text-sm">Загрузка уровней...</p>
        ) : levels.length === 0 ? (
          <div className="text-center py-[50px] text-[var(--ink-soft)]">
            <span className="text-[50px] block mb-2">🧭</span>
            Уровней пока нет
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {levels.map((level) => {
              const completedLessons = level.completedLessons;
              const totalLessons = level.totalLessons;
              const completedArr = Array.from({ length: totalLessons }, (_, i) => i < completedLessons);
              const locked = level.unlocked === false;
              return (
                <button
                  key={level.id}
                  onClick={() => !locked && router.push(`/learn?levelId=${level.id}`)}
                  disabled={locked}
                  className={`relative kid-section-card card-shadow active:scale-95 transition-transform text-left ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className="absolute top-3 right-3 sticker-badge">
                    {level.learnedCards}/{level.totalCards}
                  </span>
                  <span className="playful-emoji">{level.emoji}</span>
                  <div className="font-extrabold text-[16px]">{level.name}</div>
                  <div className="text-[13px] text-[var(--ink-soft)] font-semibold mb-3">{level.nameKz}</div>
                  <div className="text-[13px] text-[var(--ink-soft)] mb-2">
                    Уроков: {totalLessons}, выполнено: {completedLessons}
                  </div>
                  <LearningPath
                    totalLessons={totalLessons}
                    currentLesson={Math.min(completedLessons, totalLessons - 1)}
                    completed={completedArr}
                    variant="horizontal"
                  />
                  {locked && (
                    <div className="mt-4 text-[13px] font-bold text-[var(--ink-soft)]">Закрыто. Сначала пройди предыдущий уровень.</div>
                  )}
                  {level.finished && (
                    <div className="mt-4 text-[13px] font-bold text-[var(--good)]">Уровень завершён</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
