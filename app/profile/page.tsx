"use client";
import useSWR from "swr";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type LevelProgress = {
  id: string;
  name: string;
  nameKz: string;
  emoji: string;
  number: number;
  totalCards: number;
  totalLessons: number;
  completedLessons: number;
  unlocked?: boolean;
  finished?: boolean;
};

type RecentTest = {
  id: string;
  levelName: string;
  levelEmoji: string;
  lessonIndex: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
};

type StatsResponse = {
  learnedWords: number;
  completedTests: number;
  averageScore: number;
  recentTests: RecentTest[];
  levels: LevelProgress[];
};

export default function ProfilePage() {
  const { data: stats } = useSWR<StatsResponse>("/api/progress/stats", fetcher);
  const levels = stats?.levels ?? [];
  const recentTests = stats?.recentTests ?? [];

  return (
    <>
      <AppHeader />
      <main className="max-w-[600px] mx-auto px-4 pb-28 animate-fade-in-up">
        <h1 className="text-[26px] font-extrabold mb-3">Мой прогресс 🏆</h1>
        
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-[var(--card)] card-shadow rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[85px] border border-[var(--line)]">
            <div className="text-[22px] font-black text-[var(--accent-dark)] mt-0.5">{stats?.learnedWords ?? 0}</div>
            <div className="text-[10px] text-[var(--ink-soft)] font-extrabold uppercase tracking-wide leading-tight">слов выучено</div>
          </div>
          <div className="bg-[var(--card)] card-shadow rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[85px] border border-[var(--line)]">
            <div className="text-[22px] font-black text-[var(--accent-dark)] mt-0.5">{stats?.completedTests ?? 0}</div>
            <div className="text-[10px] text-[var(--ink-soft)] font-extrabold uppercase tracking-wide leading-tight">тестов пройдено</div>
          </div>
          <div className="bg-[var(--card)] card-shadow rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[85px] border border-[var(--line)]">
            <div className="text-[22px] font-black text-[var(--good)] mt-0.5">{stats?.averageScore ?? 0}%</div>
            <div className="text-[10px] text-[var(--ink-soft)] font-extrabold uppercase tracking-wide leading-tight">средний балл</div>
          </div>
        </div>

        {/* Прогресс по уровням */}
        <h2 className="text-[18px] font-extrabold mb-3 text-[var(--ink)]">Путь обучения</h2>
        <div className="flex flex-col gap-3 mb-6">
          {levels.map((level) => {
            const pct = level.totalLessons > 0 ? Math.round((level.completedLessons / level.totalLessons) * 100) : 0;
            return (
              <div key={level.id} className="bg-[var(--card)] card-shadow rounded-[22px] p-3.5 flex gap-3.5 items-center border border-[var(--line)]">
                <div className="h-14 w-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-2xl flex-shrink-0 card-shadow">{level.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-[15px] truncate">{level.number}. {level.name}</span>
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg ${level.finished ? "bg-[var(--good-soft)] text-[var(--good)]" : "bg-[var(--accent-soft)] text-[var(--accent-dark)]"}`}>
                      {level.finished ? "Завершён" : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-lg bg-[var(--line)] overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-lg transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-[var(--ink-soft)] font-bold mt-1.5">{level.completedLessons} из {level.totalLessons} уроков</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* История тестов */}
        <h2 className="text-[18px] font-extrabold mb-3 text-[var(--ink)]">История тестов 📝</h2>
        {recentTests.length === 0 ? (
          <div className="bg-[var(--card)] card-shadow rounded-[22px] p-5 text-center text-[var(--ink-soft)] text-sm border border-dashed border-[var(--line)]">
            Ты ещё не проходил тесты. Время проверить свои знания!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTests.map((test) => {
              const testPct = test.totalCount > 0 ? Math.round((test.correctCount / test.totalCount) * 100) : 0;
              const dateFormatted = new Date(test.completedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={test.id} className="bg-[var(--card)] card-shadow rounded-2xl p-3 flex justify-between items-center border border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{test.levelEmoji}</span>
                    <div>
                      <div className="font-extrabold text-[14px] text-[var(--ink)]">{test.levelName} {test.lessonIndex > 0 ? `— урок ${test.lessonIndex}` : "(финальный тест)"}</div>
                      <div className="text-[10px] text-[var(--ink-soft)] font-bold">{dateFormatted}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[14px] text-[var(--accent-dark)]">
                      {test.correctCount} из {test.totalCount}
                    </div>
                    <div className={`text-[10px] font-black ${testPct >= 80 ? "text-[var(--good)]" : testPct >= 50 ? "text-[var(--accent)]" : "text-[var(--bad)]"}`}>
                      {testPct}% правильных
                    </div>
                  </div>
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
