"use client";
import React from "react";
import { Folder } from "@/components/icons";

type Props = {
  sections: any[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
};

export default function SectionList({ sections, activeSection, onSelectSection }: Props) {
  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">Разделы</h2>
          <p className="text-sm text-[var(--ink-soft)]">Выберите раздел для редактирования карточек.</p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className={`w-full text-left rounded-[16px] border px-4 py-3 transition focus:outline-none ${
              activeSection === section.id
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                : "border-[var(--line)] bg-white hover:border-[var(--accent-dark)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gray-50 text-[var(--ink-soft)]">
                <Folder size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[var(--ink)] truncate">{section.name}</div>
                <div className="text-xs text-[var(--ink-soft)] truncate">{section.nameKz || "Без названия"}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
