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
      <main className="max-w-[600px] mx-auto px-4 pb-28 animate-fade-in-up">
        <h1 className="text-[26px] font-extrabold mt-4 mb-1">Сәлем, {user.name}! 👋</h1>
        <p className="text-[var(--ink-soft)] text-[14px] mb-[20px] font-medium">
          Продолжай путь обучения: выбирай уровень и начинай уроки или разделы.
        </p>

        {isLoading ? (
          <p className="text-[var(--ink-soft)] text-sm">Загрузка уровней...</p>
        ) : levels.length === 0 ? (
          <div className="text-center py-[50px] text-[var(--ink-soft)]">
            <span className="text-[50px] block mb-2">🧭</span>
            Уровней пока нет
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[20px]">
            {levels.map((level) => {
              const completedLessons = level.completedLessons;
              const totalLessons = level.totalLessons;
              const completedArr = Array.from({ length: totalLessons }, (_, i) => i < completedLessons);
              const locked = level.unlocked === false;
              return (
                <div
                  key={level.id}
                  className={`bg-white rounded-[24px] border-2 border-[var(--line)] p-5 shadow-sm transition-all duration-200 hover:border-[var(--accent)] hover:shadow-md ${
                    locked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-[44px] flex-shrink-0">{level.emoji || "🎯"}</span>
                      <div className="min-w-0">
                        <div className="font-extrabold text-[18px] text-[var(--ink)] truncate">{level.title}</div>
                        <div className="text-[13px] text-[var(--ink-soft)] font-semibold truncate">
                          {level.description}
                        </div>
                      </div>
                    </div>
                    <span className="sticker-badge flex-shrink-0">
                      {level.learnedCards}/{level.totalCards}
                    </span>
                  </div>

                  <div className="mt-3 text-[13px] text-[var(--ink-soft)] font-bold">
                    Уроков: {totalLessons}, выполнено: {completedLessons}
                  </div>

                  <div className="mt-2.5">
                    <LearningPath
                      totalLessons={totalLessons}
                      currentLesson={Math.min(completedLessons, totalLessons - 1)}
                      completed={completedArr}
                      variant="horizontal"
                    />
                  </div>

                  {/* Level action */}
                  {!locked && (
                    <button
                      onClick={() => router.push(`/learn?levelId=${level.id}`)}
                      className="mt-4 w-full rounded-[16px] bg-[var(--accent)] text-white py-3.5 text-[14px] font-extrabold hover:brightness-95 active:scale-98 transition shadow-sm cursor-pointer"
                    >
                      🚀 Пройти уроки уровня
                    </button>
                  )}

                  {/* Nested Sections */}
                  {level.sections && level.sections.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-dashed border-[var(--line)] text-left space-y-2.5">
                      <div className="text-[11px] font-extrabold text-[var(--ink-soft)] uppercase tracking-wider">
                        Разделы уровня:
                      </div>
                      <div className="grid gap-2">
                        {level.sections.map((sec: any) => (
                          <button
                            key={sec.id}
                            onClick={() => router.push(`/learn/${sec.id}`)}
                            className="w-full flex items-center justify-between p-3 rounded-[16px] bg-gray-50 border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition active:scale-[0.99] text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl flex-shrink-0">{sec.emoji || "📁"}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--ink)] truncate">{sec.name}</div>
                                <div className="text-[10px] text-[var(--ink-soft)] truncate">{sec.nameKz}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-[var(--ink-soft)] bg-white border border-[var(--line)] px-2.5 py-1 rounded-full flex-shrink-0 ml-1">
                              {sec.learnedCards}/{sec.totalCards}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {locked && (
                    <div className="mt-4 text-[13px] font-bold text-[var(--ink-soft)] text-center">
                      🔒 Уровень закрыт. Пройдите предыдущие уровни.
                    </div>
                  )}
                  {level.finished && (
                    <div className="mt-4 text-[13px] font-bold text-[var(--good)] text-center">
                      🎉 Уровень полностью пройден!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
