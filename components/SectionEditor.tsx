"use client";
import React from "react";
import type { LevelDTO, SectionDTO } from "@/lib/types";

type Props = {
  levels: LevelDTO[];
  sectionForm: Partial<SectionDTO>;
  setSectionForm: React.Dispatch<React.SetStateAction<Partial<SectionDTO>>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
};

export default function SectionEditor({
  levels,
  sectionForm,
  setSectionForm,
  onSave,
  onCancel,
  saving,
}: Props) {
  return (
    <div className="w-full min-w-0 rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {sectionForm.id ? "Редактировать раздел" : "Создать раздел"}
          </h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Укажите название раздела и его уровень.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Уровень</span>
          <select
            value={sectionForm.levelId || ""}
            onChange={(e) => setSectionForm((prev) => ({ ...prev, levelId: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          >
            <option value="">Выберите уровень</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.number}. {level.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>Эмодзи</span>
          <input
            type="text"
            value={sectionForm.emoji || ""}
            onChange={(e) => setSectionForm((prev) => ({ ...prev, emoji: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Название раздела</span>
          <input
            type="text"
            value={sectionForm.name || ""}
            onChange={(e) => setSectionForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Название на казахском</span>
          <input
            type="text"
            value={sectionForm.nameKz || ""}
            onChange={(e) => setSectionForm((prev) => ({ ...prev, nameKz: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[16px] border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] transition hover:border-[var(--accent-dark)]"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !sectionForm.name?.trim() || !sectionForm.levelId}
          className="rounded-[16px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
