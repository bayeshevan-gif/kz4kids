"use client";
import { Layers, Folder, BookOpen, Plus, Home } from "@/components/icons";
import React from "react";

type Props = {
  title?: string;
  breadcrumbs?: string[];
  onAddLevel?: () => void;
  onAddSection?: () => void;
  onAddCard?: () => void;
  onHome?: () => void;
};

export default function AdminHeader({ title = "Панель управления", breadcrumbs = ["Admin"], onAddLevel, onAddSection, onAddCard, onHome }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <button onClick={onHome} className="p-2 rounded-md bg-white shadow-sm border border-[var(--line)] text-[var(--ink-soft)] hover:bg-gray-50">
          <Home size={18} />
        </button>
        <div>
          <div className="text-sm text-[var(--ink-soft)]">{breadcrumbs.join(" / ")}</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onAddLevel} className="flex items-center gap-2 bg-white border border-[var(--line)] text-sm text-[var(--ink)] px-3 py-2 rounded-md hover:shadow-md">
          <Layers size={16} /> Уровень
        </button>
        <button onClick={onAddSection} className="flex items-center gap-2 bg-white border border-[var(--line)] text-sm text-[var(--ink)] px-3 py-2 rounded-md hover:shadow-md">
          <Folder size={16} /> Раздел
        </button>
        <button onClick={onAddCard} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm px-3 py-2 rounded-md hover:brightness-95">
          <Plus size={16} /> Карточка
        </button>
      </div>
    </div>
  );
}
