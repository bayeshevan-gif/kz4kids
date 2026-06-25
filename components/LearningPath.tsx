"use client";

import React from "react";

type Props = {
  totalLessons: number;
  currentLesson: number; // 0-based
  completed: boolean[]; // length totalLessons
};

export default function LearningPath({ totalLessons, currentLesson, completed }: Props) {
  const items = Array.from({ length: totalLessons }, (_, i) => i);
  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-center gap-4 px-1">
        {items.map((i) => {
          const isDone = completed[i];
          const isCurrent = i === currentLesson;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold ${isDone ? 'bg-[var(--good)] text-white shadow-[0_8px_18px_rgba(79,157,110,0.12)]' : isCurrent ? 'bg-[var(--accent)] text-white' : 'bg-white border-2 border-[var(--line)] text-[var(--ink)]`}`}>
                {isDone ? '✓' : i + 1}
              </div>
              {i < totalLessons - 1 && (
                <div className={`h-1 w-8 ${completed[i] && completed[i+1] ? 'bg-[var(--good)]' : 'bg-[var(--line)]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
