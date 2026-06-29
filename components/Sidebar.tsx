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

export default function Sidebar({ levels, sections, activeLevel, activeSection, onSelectLevel, onSelectSection, onMoveSection }: Props) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-[16px] border border-[var(--line)] card-shadow">
        <div className="flex items-center gap-3 mb-3">
          <Layers size={20} />
          <div>
            <div className="text-sm font-bold">Уровни</div>
            <div className="text-xs text-[var(--ink-soft)]">Управление уровнями</div>
          </div>
        </div>
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
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
              className={`w-full text-left rounded-md p-3 border transition-all flex items-center justify-between ${
                activeLevel === level.id ? "bg-[var(--accent)] text-white" : "bg-white border-[var(--line)] hover:border-[var(--accent-dark)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <div className="text-sm font-semibold truncate">{level.number}. {level.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white rounded-[16px] border border-[var(--line)] card-shadow">
        <div className="flex items-center gap-3 mb-3">
          <Folder size={20} />
          <div>
            <div className="text-sm font-bold">Разделы</div>
            <div className="text-xs text-[var(--ink-soft)]">Список разделов</div>
          </div>
        </div>
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {sections.map((s) => {
            const level = levels.find((l) => l.id === s.levelId);
            return (
              <div
                key={s.id}
                onClick={() => onSelectSection(s.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", s.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
                  activeSection === s.id ? "bg-[var(--accent)] text-white" : "bg-white border border-[var(--line)] hover:border-[var(--accent-dark)]"
                } ${!s.levelId ? "border-orange-300 bg-orange-50" : ""}`}
              >
                <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center"><Folder size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                  <div className="text-[12px] text-[var(--ink-soft)] truncate">
                    {level ? `${level.number}. ${level.name}` : s.nameKz || "⚠️ Без уровня"}
                  </div>
                </div>
                {!s.levelId && <span className="text-orange-500 text-xs">⚠️</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
