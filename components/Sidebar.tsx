"use client";
import React from "react";
import { Folder, Layers } from "@/components/icons";

type Props = {
  levels: any[];
  sections: any[];
  activeLevel: string | null;
  activeSection: string | null;
  onSelectLevel: (id: string) => void;
  onSelectSection: (id: string) => void;
  onMoveSection?: (sectionId: string, levelId: string) => Promise<void>;
};

export default function Sidebar({
  levels,
  sections,
  activeLevel,
  activeSection,
  onSelectLevel,
  onSelectSection,
  onMoveSection,
}: Props) {
  // Find sections without any levels linked
  const unassignedSections = sections.filter(
    (s) => !s.levelIds || s.levelIds.length === 0
  );

  return (
    <div className="space-y-6">
      {/* Levels & Nested Sections */}
      <div className="p-4 bg-white rounded-[20px] border border-[var(--line)] card-shadow">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="text-[var(--accent)]" size={20} />
          <div>
            <div className="text-sm font-bold text-[var(--ink)]">Структура обучения</div>
            <div className="text-xs text-[var(--ink-soft)] font-medium">Уровни и их разделы</div>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {levels.map((level) => {
            const levelSecs = sections.filter(
              (s) => s.levelIds && s.levelIds.includes(level.id)
            );
            const isLevelActive = activeLevel === level.id;

            return (
              <div
                key={level.id}
                className={`rounded-[16px] border p-2 transition-all ${
                  isLevelActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]/30"
                    : "border-[var(--line)] bg-white hover:border-[var(--accent-dark)]"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId && onMoveSection) {
                    onMoveSection(sectionId, level.id);
                  }
                }}
              >
                {/* Level Title button */}
                <button
                  type="button"
                  onClick={() => onSelectLevel(level.id)}
                  className={`w-full text-left rounded-[12px] p-2.5 flex items-center gap-3 transition-colors ${
                    isLevelActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--ink)] hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{level.emoji || "🎯"}</span>
                  <span className="text-sm font-bold truncate">
                    {level.order}. {level.title}
                  </span>
                </button>

                {/* Nested Sections of this level */}
                <div className="mt-1.5 pl-3 pr-1 space-y-1 border-l-2 border-dashed border-[var(--line)] ml-5">
                  {levelSecs.length === 0 ? (
                    <div className="text-[11px] text-[var(--ink-soft)] py-1.5 px-2.5 italic">
                      Нет разделов (перетащите сюда)
                    </div>
                  ) : (
                    levelSecs.map((s) => {
                      const isSectionActive = activeSection === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectSection(s.id)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", s.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className={`w-full text-left rounded-[10px] py-1.5 px-2.5 text-xs font-semibold flex items-center justify-between transition ${
                            isSectionActive
                              ? "bg-[var(--accent-soft)] text-[var(--accent-dark)] border border-[var(--accent)]/30"
                              : "text-[var(--ink-soft)] hover:bg-gray-50 hover:text-[var(--ink)] border border-transparent"
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <span>{s.emoji || "📁"}</span>
                            <span className="truncate">{s.name}</span>
                          </span>
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0 text-gray-500 font-bold ml-1">
                            {s.totalCards || 0}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unassigned Sections card */}
      <div className="p-4 bg-white rounded-[20px] border border-[var(--line)] card-shadow">
        <div className="flex items-center gap-3 mb-3">
          <Folder className="text-orange-500" size={20} />
          <div>
            <div className="text-sm font-bold text-[var(--ink)]">Без уровня ⚠️</div>
            <div className="text-xs text-[var(--ink-soft)] font-medium">Разделы вне структуры</div>
          </div>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {unassignedSections.length === 0 ? (
            <div className="text-xs text-[var(--ink-soft)] text-center py-4 italic">
              Все разделы привязаны к уровням
            </div>
          ) : (
            unassignedSections.map((s) => {
              const isSectionActive = activeSection === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSection(s.id)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", s.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className={`flex items-center justify-between p-3 rounded-[14px] cursor-pointer transition-all border ${
                    isSectionActive
                      ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-dark)] font-bold shadow-sm"
                      : "bg-orange-50/50 border-orange-200/60 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{s.emoji || "📁"}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--ink)] truncate">{s.name}</div>
                      <div className="text-[10px] text-[var(--ink-soft)] truncate">{s.nameKz}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-1">
                    {s.totalCards || 0}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
