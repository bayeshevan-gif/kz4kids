"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { speak } from "@/lib/useSpeech";
import type { LevelDTO, TestQuestionDTO } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TestPage() {
  const router = useRouter();
  const search = useSearchParams();
  const levelId = search.get("levelId");
  const lessonIndex = Number(search.get("lessonIndex") ?? "0");
  const final = search.get("final") === "1";

  const [levelsData, setLevelsData] = useState<{ levels: LevelDTO[] } | null>(null);
  const [questions, setQuestions] = useState<TestQuestionDTO[] | null>(null);
  const [error, setError] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctCardIds, setCorrectCardIds] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const finished = questions ? qIndex >= questions.length : false;
  const currentLevel = levelsData?.levels.find((lvl) => lvl.id === levelId);
  const isListView = !levelId;
  const testTitle = final
    ? currentLevel
      ? `Финальный тест уровня ${currentLevel.number}`
      : "Финальный тест"
    : lessonIndex > 0
    ? `Тест урока ${lessonIndex}`
    : "Тест уровня";

  useEffect(() => {
    if (isListView) {
      fetcher("/api/learning/levels").then((data) => setLevelsData(data));
    }
  }, [isListView]);

  useEffect(() => {
    if (!levelId) return;
    const params = new URLSearchParams();
    params.set("levelId", levelId);
    if (lessonIndex > 0) params.set("lessonIndex", String(lessonIndex));
    if (final) params.set("final", "1");

    setError("");
    setQuestions(null);
    fetch(`/api/tests/generate?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuestions(data.questions);
        }
      })
      .catch(() => setError("Не удалось получить вопросы"));
  }, [levelId, lessonIndex, final]);

  useEffect(() => {
    if (finished && !submitted && questions) {
      setSubmitted(true);
      fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId,
          lessonIndex: final ? 0 : lessonIndex,
          correctCount,
          totalCount: questions.length,
          correctCardIds,
        }),
      });
    }
  }, [finished, submitted, levelId, lessonIndex, final, correctCount, questions, correctCardIds]);

  const progressPct = useMemo(() => {
    if (!questions) return 0;
    return Math.round((qIndex / questions.length) * 100);
  }, [qIndex, questions]);

  function handleAnswer(optId: string) {
    if (answered || !questions) return;
    setAnswered(optId);
    const opt = questions[qIndex].options.find((o) => o.id === optId);
    if (opt) {
      fetch("/api/voice-play", { method: "POST" });
      // fallback: no additional action needed
    }
    if (optId === questions[qIndex].card.id) {
      setCorrectCount((c) => c + 1);
      setCorrectCardIds((current) => [...current, questions[qIndex].card.id]);
    }
    setTimeout(() => {
      setQIndex((i) => i + 1);
      setAnswered(null);
    }, 1100);
  }

  if (isListView) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px]">
          <h1 className="text-[26px] font-extrabold mb-1">Тесты 📝</h1>
          <p className="text-[var(--ink-soft)] text-[15px] mb-[18px]">
            Выбери уровень для проверки знаний или финальный тест.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {levelsData?.levels.map((level) => {
              const locked = level.unlocked === false;
              return (
                <div key={level.id} className="rounded-[22px] bg-[var(--card)] card-shadow p-[18px_14px] text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[40px]">{level.emoji}</span>
                    <span className="text-[12px] text-[var(--ink-soft)] font-semibold">Уроков {level.totalLessons}</span>
                  </div>
                  <div className="font-extrabold text-[16px] mb-2">{level.name}</div>
                  <div className="text-[13px] text-[var(--ink-soft)] mb-4">{level.nameKz}</div>
                  <button
                    disabled={locked}
                    onClick={() => router.push(`/learn?levelId=${level.id}`)}
                    className="w-full rounded-[18px] bg-[var(--accent)] text-white py-3 text-[15px] font-bold disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                  >
                    Перейти к урокам
                  </button>
                  <button
                    disabled={!level.finished}
                    onClick={() => router.push(`/test?levelId=${level.id}&final=1`)}
                    className="mt-3 w-full rounded-[18px] border-2 border-[var(--line)] bg-white py-3 text-[15px] font-bold text-[var(--ink)] disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                  >
                    {level.finished ? "Финальный тест" : "Финальный тест"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px] py-16 text-center">
          <p className="text-[var(--ink-soft)] mb-4">{error}</p>
          <button onClick={() => router.push("/test")} className="rounded-[14px] bg-[var(--accent)] text-white px-5 py-3 font-bold">
            Назад к выбору
          </button>
        </main>
      </>
    );
  }

  if (!questions) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px]"><p className="text-[var(--ink-soft)] text-sm">Готовим вопросы...</p></main>
      </>
    );
  }

  if (finished) {
    const total = questions.length;
    const pct = Math.round((correctCount / total) * 100);
    let emoji = "🌟";
    let msg = "Отлично! Ты молодец!";
    if (pct < 50) { emoji = "💪"; msg = "Попробуй ещё раз, у тебя получится!"; }
    else if (pct < 80) { emoji = "👍"; msg = "Хорошо! Ещё немного практики!"; }

    return (
      <>
        <AppHeader />
        <main className="px-[18px] text-center pt-8">
          <div className="text-[80px] mb-2">{emoji}</div>
          <div className="text-[32px] font-extrabold text-[var(--accent-dark)] mb-1.5">
            {correctCount} / {total}
          </div>
          <p className="text-[var(--ink-soft)] mb-7">{msg}</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-[14px] bg-[var(--accent)] text-white font-extrabold py-[13px] px-8"
          >
            Готово
          </button>
        </main>
      </>
    );
  }

  const q = questions[qIndex];
  return (
    <>
      <AppHeader />
      <main className="px-[18px] flex flex-col items-center pt-2">
        <div className="mb-3 text-[14px] font-extrabold text-[var(--accent-dark)]">{testTitle}</div>
        <div className="w-full h-2 rounded-lg bg-[var(--line)] mb-[22px] overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-lg transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="w-[220px] h-[220px] rounded-[28px] bg-[var(--card)] card-shadow flex items-center justify-center text-[90px] mb-2.5 overflow-hidden">
          {q.card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.card.imageUrl} alt={q.card.ru} className="h-full w-full object-cover" />
          ) : (
            q.card.emoji
          )}
        </div>
        <div className="text-[22px] font-extrabold mb-1">{q.card.ru}</div>
        <button
          onClick={() => speak(q.card.ru, "ru", q.card.audioRuUrl)}
          className={`mb-[22px] rounded-[10px] px-3 py-1.5 text-xs font-bold ${q.card.audioRuUrl ? "bg-[var(--good-soft)] text-[var(--good)]" : "bg-[var(--accent-soft)] text-[var(--accent-dark)]"}`}
        >
          {q.card.audioRuUrl ? "🎙️ Слушать" : "🔊 Слушать"}
        </button>

        <div className="w-full flex flex-col gap-3">
          {q.options.map((opt) => {
            let cls = "bg-[var(--card)] border-[var(--line)] text-[var(--ink)]";
            if (answered) {
              if (opt.id === q.card.id) cls = "bg-[var(--good-soft)] border-[var(--good)] text-[var(--good)]";
              else if (opt.id === answered) cls = "bg-[var(--bad-soft)] border-[var(--bad)] text-[var(--bad)]";
            }
            return (
              <button
                key={opt.id}
                disabled={!!answered}
                onClick={() => handleAnswer(opt.id)}
                className={`rounded-[18px] border-2 p-4 text-[17px] font-bold flex justify-between items-center ${cls}`}
              >
                <span>{opt.kz}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); speak(opt.kz, "kz", opt.audioKzUrl); }}
                  className="text-[18px] cursor-pointer"
                >
                  {opt.audioKzUrl ? "🎙️" : "🔊"}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </>
  );
}
