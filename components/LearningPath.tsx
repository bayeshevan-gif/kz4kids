"use client";

import React from "react";

type Props = {
  totalLessons: number;
  currentLesson: number; // 0-based
  completed: boolean[]; // length totalLessons
  variant?: "horizontal" | "vertical-with-tests";
};

export default function LearningPath({ totalLessons, currentLesson, completed, variant = "horizontal" }: Props) {
  const lessonIndexes = Array.from({ length: totalLessons }, (_, i) => i);

  if (variant === "vertical-with-tests") {
    const nodes = lessonIndexes.flatMap((lesson, index) => {
      if (index === 0) {
        return [{ type: "lesson", lesson }];
      }
      return [
        { type: "test", lesson },
        { type: "lesson", lesson },
      ];
    });

    return (
      <div className="flex flex-col items-start gap-2">
        {nodes.map((node, idx) => {
          const isLesson = node.type === "lesson";
          const lessonIndex = node.lesson;
          const lessonDone = completed[lessonIndex];
          const prevLessonDone = lessonIndex > 0 ? completed[lessonIndex - 1] : false;
          const isCurrentLesson = isLesson && lessonIndex === currentLesson;
          const isAvailableTest = !isLesson && prevLessonDone;
          const nodeClass = isLesson
            ? lessonDone
              ? 'bg-[var(--good)] text-white shadow-[0_8px_18px_rgba(79,157,110,0.12)]'
              : isCurrentLesson
              ? 'bg-[var(--accent)] text-white'
              : 'bg-white border-2 border-[var(--line)] text-[var(--ink)]'
            : isAvailableTest
            ? 'bg-[var(--accent-soft)] border-2 border-[var(--accent)] text-[var(--accent-dark)]'
            : 'bg-white border-2 border-[var(--line)] text-[var(--ink)]';

          return (
            <div key={`${node.type}-${lessonIndex}`} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold ${nodeClass}`}>
                {isLesson ? lessonIndex + 1 : 'T'}
              </div>
              {idx < nodes.length - 1 && (
                <div className={`w-1 h-8 ${lessonDone || (node.type === 'test' && prevLessonDone) ? 'bg-[var(--good)]' : 'bg-[var(--line)]'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-center gap-4 px-1">
        {lessonIndexes.map((lessonIndex) => {
          const isDone = completed[lessonIndex];
          const isCurrent = lessonIndex === currentLesson;
          const statusClass = isDone
            ? 'bg-[var(--good)] text-white shadow-[0_8px_18px_rgba(79,157,110,0.12)]'
            : isCurrent
            ? 'bg-[var(--accent)] text-white'
            : 'bg-white border-2 border-[var(--line)] text-[var(--ink)]';
          return (
            <div key={lessonIndex} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold ${statusClass}`}>
                {isDone ? '✓' : lessonIndex + 1}
              </div>
              {lessonIndex < totalLessons - 1 && (
                <div className={`h-1 w-8 ${completed[lessonIndex] && completed[lessonIndex + 1] ? 'bg-[var(--good)]' : 'bg-[var(--line)]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
