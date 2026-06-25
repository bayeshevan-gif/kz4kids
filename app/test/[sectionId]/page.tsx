"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { speak } from "@/lib/useSpeech";
import type { TestQuestionDTO } from "@/lib/types";

export default function TestRunPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<TestQuestionDTO[] | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const finished = questions ? qIndex >= questions.length : false;

  useEffect(() => {
    if (finished && !submitted && questions) {
      setSubmitted(true);
      fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, correctCount, totalCount: questions.length }),
      });
    }
  }, [finished, submitted, sectionId, correctCount, questions]);

  useEffect(() => {
    fetch(`/api/tests/generate?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuestions(data.questions);
        }
      });
  }, [sectionId]);

  if (error) {
    return (
      <>
        <AppHeader />
        <main className="px-[18px] text-center py-16">
          <p className="text-[var(--ink-soft)] mb-4">{error}</p>
          <button onClick={() => router.push("/test")} className="rounded-[14px] bg-[var(--accent)] text-white font-extrabold px-5 py-3">
            Назад к разделам
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

  if (finished && questions) {
    const total = questions.length;
    const pct = Math.round((correctCount / total) * 100);
    let emoji = "🌟", msg = "Отлично! Ты молодец!";
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
  const progressPct = Math.round((qIndex / questions.length) * 100);

  function handleAnswer(optId: string) {
    if (answered) return;
    setAnswered(optId);
    const opt = q.options.find((o) => o.id === optId);
    if (opt) speak(opt.kz, "kz", opt.audioKzUrl);
    if (optId === q.card.id) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      setQIndex((i) => i + 1);
      setAnswered(null);
    }, 1100);
  }

  return (
    <>
      <AppHeader />
      <main className="px-[18px] flex flex-col items-center pt-2">
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
