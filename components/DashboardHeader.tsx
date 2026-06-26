"use client";
import React from "react";
import { Folder, Layers, Home, Plus } from "@/components/icons";

type Props = {
  title?: string;
  breadcrumbs?: string[];
  counts: { levels: number; sections: number; cards: number };
  onHome: () => void;
  onAddLevel: () => void;
  onAddSection: () => void;
  onAddCard: () => void;
};

export default function DashboardHeader({
  title = "Панель управления",
  breadcrumbs = ["Dashboard", "Admin"],
  counts,
  onHome,
  onAddLevel,
  onAddSection,
  onAddCard,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="text-sm text-[var(--ink-soft)]">{breadcrumbs.join(" / ")}</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">{title}</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] shadow-sm transition hover:border-[var(--accent-dark)]"
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={onAddLevel}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] shadow-sm transition hover:border-[var(--accent-dark)]"
          >
            <Layers size={16} />
            Уровень
          </button>
          <button
            onClick={onAddSection}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] shadow-sm transition hover:border-[var(--accent-dark)]"
          >
            <Folder size={16} />
            Раздел
          </button>
          <button
            onClick={onAddCard}
            className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <Plus size={16} />
            Карточка
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
          <div className="text-sm text-[var(--ink-soft)]">Уровни</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{counts.levels}</div>
        </div>
        <div className="rounded-[20px] border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
          <div className="text-sm text-[var(--ink-soft)]">Разделы</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{counts.sections}</div>
        </div>
        <div className="rounded-[20px] border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
          <div className="text-sm text-[var(--ink-soft)]">Карточки</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{counts.cards}</div>
        </div>
      </div>
    </div>
  );
}
