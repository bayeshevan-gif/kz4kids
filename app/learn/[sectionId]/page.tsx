"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import LearningPath from "@/components/LearningPath";
import { speak } from "@/lib/useSpeech";
import type { CardDTO, SectionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LearnSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: sectionsData } = useSWR<{ sections: SectionDTO[] }>("/api/sections", fetcher);
  const { data: cardsData, mutate } = useSWR<{ cards: CardDTO[] }>(
    `/api/cards?sectionId=${sectionId}`,
    fetcher
  );

  const section = sectionsData?.sections.find((s) => s.id === sectionId);
  const cards = cardsData?.cards ?? [];
  const cardsPerLesson = section?.cardsPerLesson ?? 6;
  const lessons: CardDTO[][] = [];
  for (let i = 0; i < cards.length; i += cardsPerLesson) {
    lessons.push(cards.slice(i, i + cardsPerLesson));
  }
  const currentLessonIndex = Math.floor(currentIndex / cardsPerLesson);
  const lessonsCompleted = lessons.map((ls) => ls.every((c) => c.learned));

  // Automatically speak the Kazakh word when loading a card
  useEffect(() => {
    if (cards.length > 0 && cards[currentIndex]) {
      const card = cards[currentIndex];
      speak(card.kz, "kz", card.audioKzUrl);
    }
  }, [currentIndex, cards]);

  async function toggleLearned(cardId: string) {
    await fetch("/api/progress/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    mutate();
  }

  async function completeLessonIfNeeded(prevLessonIndex: number) {
    if (prevLessonIndex < 0 || prevLessonIndex >= lessons.length) return;
    const ids = lessons[prevLessonIndex].map((c) => c.id);
    if (ids.length === 0) return;
    await fetch("/api/progress/complete-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardIds: ids }),
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
            className="h-[38px] w-[38px] rounded-[12px] bg-[var(--card)] card-shadow text-[var(--accent-dark)] flex items-center justify-center active:scale-90 transition-transform"
          >
            ←
          </button>
          <div>
            <h1 className="text-[22px] font-extrabold">
              {section ? `${section.emoji} ${section.name}` : "Загрузка..."}
            </h1>
            <p className="text-[var(--ink-soft)] text-[13px]">{section?.nameKz}</p>
            {lessons.length > 0 && (
              <div className="mt-3">
                <LearningPath totalLessons={lessons.length} currentLesson={Math.min(currentLessonIndex, lessons.length-1)} completed={lessonsCompleted} />
              </div>
            )}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-[50px] text-[var(--ink-soft)]">
            <span className="text-[50px] block mb-2">🗂️</span>
            В этом разделе пока нет карточек
          </div>
        ) : currentIndex >= cards.length ? (
          /* Экран успешного завершения */
          <div className="bg-[var(--card)] card-shadow rounded-[28px] p-6 text-center mt-4">
            <span className="text-[80px] block mb-4 animate-bounce">🎉</span>
            <h2 className="text-[24px] font-extrabold text-[var(--accent-dark)] mb-2">Отличная работа!</h2>
            <p className="text-[var(--ink-soft)] text-[15px] mb-6">
              Ты изучил все карточки в разделе «{section?.name}»!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/test/${sectionId}`)}
                className="w-full rounded-[16px] bg-[var(--good)] text-white font-extrabold py-3.5 text-[16px] card-shadow active:scale-95 transition-transform cursor-pointer"
              >
                📝 Пройти тест
              </button>
              <button
                onClick={() => setCurrentIndex(0)}
                className="w-full rounded-[16px] bg-[var(--accent-soft)] text-[var(--accent-dark)] font-extrabold py-3.5 text-[16px] active:scale-95 transition-transform cursor-pointer"
              >
                🔁 Повторить сначала
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-[16px] border-2 border-[var(--line)] bg-white text-[var(--ink-soft)] font-bold py-3.5 text-[15px] active:scale-95 transition-transform cursor-pointer"
              >
                🏠 На главную
              </button>
            </div>
          </div>
        ) : (
          /* Слайд-шоу карточек */
          <div className="flex flex-col gap-5 mt-2">
            {/* Прогресс-бар и счетчик */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-extrabold text-[var(--ink-soft)]">
                Карточка {currentIndex + 1} из {cards.length}
              </span>
              <div className="w-[120px] h-2 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Карточка */}
            {(() => {
              const c = cards[currentIndex];
              return (
                <div className="bg-[var(--card)] card-shadow rounded-[32px] p-6 flex flex-col items-center border border-[var(--line)] relative overflow-hidden min-h-[340px] justify-between">
                  {/* Кнопка "Выучено" (звездочка / галочка) */}
                  <button
                    onClick={() => toggleLearned(c.id)}
                    className="absolute top-4 right-4 h-[44px] w-[44px] rounded-[14px] flex items-center justify-center card-shadow transition-transform active:scale-90 cursor-pointer"
                    style={{ background: c.learned ? "var(--good-soft)" : "var(--accent-soft)" }}
                  >
                    {c.learned ? (
                      <span className="text-[20px]">✅</span>
                    ) : (
                      <span className="text-[20px]">⭐</span>
                    )}
                  </button>

                  {/* Изображение / Эмодзи */}
                  <div className="h-[160px] w-[160px] rounded-[24px] bg-[var(--accent-soft)] flex items-center justify-center text-[70px] overflow-hidden mt-6 flex-shrink-0 card-shadow">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt={c.ru} className="h-full w-full object-cover" />
                    ) : (
                      c.emoji
                    )}
                  </div>

                  {/* Текст и озвучка */}
                  <div className="w-full text-center mt-6 mb-4">
                    {/* Русский вариант */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-[24px] font-extrabold text-[var(--ink)]">{c.ru}</span>
                      <button
                        onClick={() => speak(c.ru, "ru", c.audioRuUrl)}
                        className={`h-[36px] w-[36px] rounded-[10px] text-[16px] flex items-center justify-center active:scale-90 transition-transform cursor-pointer ${c.audioRuUrl ? "bg-[var(--good-soft)]" : "bg-[var(--accent-soft)]"}`}
                        title={c.audioRuUrl ? "Запись (русский)" : "Синтез (русский)"}
                      >
                        {c.audioRuUrl ? "🎙️" : "🔊"}
                      </button>
                    </div>

                    {/* Казахский вариант */}
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[22px] font-bold text-[var(--accent-dark)]">{c.kz}</span>
                      <button
                        onClick={() => speak(c.kz, "kz", c.audioKzUrl)}
                        className={`h-[36px] w-[36px] rounded-[10px] text-[16px] flex items-center justify-center active:scale-90 transition-transform cursor-pointer ${c.audioKzUrl ? "bg-[var(--good-soft)]" : "bg-[var(--accent-soft)]"}`}
                        title={c.audioKzUrl ? "Запись (казахский)" : "Синтез (казахский)"}
                      >
                        {c.audioKzUrl ? "🎙️" : "🔊"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Навигация, уроки и тесты */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="text-sm font-extrabold text-[var(--ink-soft)]">Урок {Math.min(currentLessonIndex + 1, lessons.length)} из {lessons.length}</div>
                <div className="text-sm text-[var(--ink-soft)]">Карточка {currentIndex + 1}</div>
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  className="flex-1 rounded-[18px] border-2 border-[var(--line)] bg-white text-[var(--ink)] font-extrabold py-3.5 text-[15px] active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  ← Назад
                </button>
                <button
                  onClick={async () => {
                    const prevLesson = Math.floor(currentIndex / cardsPerLesson);
                    const newIndex = Math.min(currentIndex + 1, cards.length);
                    const newLesson = Math.floor(newIndex / cardsPerLesson);
                    // Если перешли на следующий урок — пометить предыдущий как завершённый
                    if (newLesson > prevLesson) {
                      await completeLessonIfNeeded(prevLesson);
                    }
                    setCurrentIndex(newIndex);
                  }}
                  className="flex-1 rounded-[18px] bg-[var(--accent)] text-white font-extrabold py-3.5 text-[15px] card-shadow active:scale-95 transition-transform cursor-pointer"
                >
                  {currentIndex >= cards.length - 1 ? "Готово 🎉" : "Дальше →"}
                </button>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => router.push(`/test/${sectionId}?lessonIndex=${currentLessonIndex + 1}`)}
                  className="flex-1 rounded-[16px] bg-[var(--accent-2)] text-[var(--accent-dark)] font-extrabold py-3 text-[15px] card-shadow active:scale-95 transition-transform"
                >
                  📝 Тест по этому уроку
                </button>
                {lessons.length >= 3 && (
                  <button
                    onClick={() => router.push(`/test/${sectionId}?cumulative=3`)}
                    className="flex-1 rounded-[16px] bg-[var(--good)] text-white font-extrabold py-3 text-[15px] card-shadow active:scale-95 transition-transform"
                  >
                    🌈 Тест за 3 урока
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
