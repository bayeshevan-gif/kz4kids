"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import LearningPath from "@/components/LearningPath";
import { speak } from "@/lib/useSpeech";
import type { CardDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LearnLevelPage() {
  return (
    <Suspense
      fallback={
        <>
          <AppHeader />
          <main className="px-[18px] py-16 text-center">
            <p className="text-[var(--ink-soft)] mb-4">Загрузка параметров...</p>
          </main>
        </>
      }
    >
      <LearnLevelContent />
    </Suspense>
  );
}

function LearnLevelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelId = searchParams.get("levelId");
  const lessonIndex = Number(searchParams.get("lessonIndex") ?? "1");

  const [data, setData] = useState<{
    level: { id: string; name: string; nameKz: string; emoji: string; number: number };
    lessonIndex: number;
    totalLessons: number;
    cards: CardDTO[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!levelId) return;

    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setLoading(true);
        setError("");
        return fetcher(`/api/learning/lesson?levelId=${encodeURIComponent(levelId)}&lessonIndex=${lessonIndex}`);
      })
      .then((result) => {
        if (cancelled || !result) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить урок");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [levelId, lessonIndex]);

  const learnedCount = useMemo(() => data?.cards.filter((card) => card.learned).length ?? 0, [data]);
  const canProceed = data?.cards.length ? true : false;

  async function toggleLearned(cardId: string) {
    await fetch("/api/progress/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    setData((prev) =>
      prev
        ? {
            ...prev,
            cards: prev.cards.map((card) =>
              card.id === cardId ? { ...card, learned: !card.learned } : card
            ),
          }
        : prev
    );
  }

  async function completeLesson() {
    if (!data) return;
    setUpdating(true);
    await fetch("/api/progress/complete-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardIds: data.cards.map((card) => card.id) }),
    });
    setUpdating(false);
    router.push(`/test?levelId=${encodeURIComponent(levelId || "")}&lessonIndex=${data.lessonIndex}`);
  }

  if (!levelId) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px] py-16 text-center">
          <p className="text-[var(--ink-soft)] mb-4">Уровень не выбран.</p>
          <button onClick={() => router.push("/")} className="rounded-[14px] bg-[var(--accent)] text-white px-5 py-3 font-bold">
            На главную
          </button>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px]"><p className="text-[var(--ink-soft)] text-sm">Загрузка урока...</p></main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px] py-16 text-center">
          <p className="text-[var(--ink-soft)] mb-4">{error || "Урок не найден"}</p>
          <button onClick={() => router.push("/")} className="rounded-[14px] bg-[var(--accent)] text-white px-5 py-3 font-bold">
            На главную
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="px-[18px] pb-24">
        <div className="flex items-center gap-2.5 mb-3.5">
          <button
            onClick={() => router.push("/")}
            className="h-[38px] w-[38px] rounded-[12px] bg-[var(--card)] card-shadow text-[var(--accent-dark)] flex items-center justify-center active:scale-90 transition-transform"
          >
            ←
          </button>
          <div>
            <h1 className="text-[22px] font-extrabold">
              {data.level.emoji} {data.level.name}
            </h1>
            <p className="text-[var(--ink-soft)] text-[13px]">{data.level.nameKz}</p>
            <div className="mt-3">
              <LearningPath
                totalLessons={data.totalLessons}
                currentLesson={Math.min(data.lessonIndex - 1, data.totalLessons - 1)}
                completed={Array.from({ length: data.totalLessons }, (_, index) => index < data.lessonIndex - 1)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] bg-[var(--card)] card-shadow p-5 border border-[var(--line)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[14px] font-extrabold text-[var(--ink-soft)]">Урок {data.lessonIndex} из {data.totalLessons}</div>
                <div className="text-[12px] text-[var(--ink-soft)]">Карточек в уроке: {data.cards.length}</div>
              </div>
              <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[13px] font-black text-[var(--accent-dark)]">
                {learnedCount}/{data.cards.length} выучено
              </div>
            </div>

            <div className="grid gap-3">
              {data.cards.map((card) => (
                <div key={card.id} className="rounded-[24px] bg-white p-4 border border-[var(--line)] flex items-center gap-4">
                  <div className="min-w-[72px] min-h-[72px] rounded-[24px] bg-[var(--accent-soft)] flex items-center justify-center text-[50px] overflow-hidden">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt={card.ru} className="w-full h-full object-cover" />
                    ) : (
                      card.emoji
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[18px] font-extrabold text-[var(--ink)]">{card.ru}</div>
                    <div className="text-[16px] text-[var(--accent-dark)] font-bold">{card.kz}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => speak(card.ru, "ru", card.audioRuUrl)}
                        className="rounded-[12px] bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-bold"
                      >
                        {card.audioRuUrl ? "🎙️ Русский" : "🔊 Русский"}
                      </button>
                      <button
                        onClick={() => speak(card.kz, "kz", card.audioKzUrl)}
                        className="rounded-[12px] bg-[var(--good-soft)] px-3 py-1 text-[12px] font-bold"
                      >
                        {card.audioKzUrl ? "🎙️ Казахский" : "🔊 Казахский"}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLearned(card.id)}
                    className={`rounded-[18px] px-4 py-2 font-bold ${card.learned ? "bg-[var(--good)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent-dark)]"}`}
                  >
                    {card.learned ? "Выучено" : "Выучить"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={completeLesson}
              disabled={!canProceed || updating}
              className="rounded-[22px] bg-[var(--accent)] text-white py-4 text-[16px] font-extrabold active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              {updating ? "Готовим тест..." : "Пройти тест по уроку"}
            </button>
            <button
              onClick={() => router.push("/test")}
              className="rounded-[22px] border-2 border-[var(--line)] bg-white text-[var(--ink)] py-4 text-[16px] font-extrabold active:scale-95 transition-transform"
            >
              Выйти к тестам
            </button>
          </div>
        </div>
      </main>
      <TabBar />
    </>
  );
}
