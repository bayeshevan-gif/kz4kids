"use client";
import React, { type Dispatch, type SetStateAction } from "react";
import type { LevelDTO } from "@/lib/types";

type Props = {
  levelForm: Partial<LevelDTO>;
  setLevelForm: Dispatch<SetStateAction<Partial<LevelDTO>>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
};

export default function LevelEditor({ levelForm, setLevelForm, onSave, onCancel, saving }: Props) {
  return (
    <div className="w-full min-w-0 rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {levelForm.id ? "Редактировать уровень" : "Создать уровень"}
          </h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Укажите название, описание и порядок уровня.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Название уровня</span>
          <input
            type="text"
            value={levelForm.title || ""}
            onChange={(e) => setLevelForm((prev: Partial<LevelDTO>) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Эмодзи</span>
          <input
            type="text"
            value={levelForm.emoji || ""}
            onChange={(e) => setLevelForm((prev: Partial<LevelDTO>) => ({ ...prev, emoji: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Описание</span>
          <textarea
            value={levelForm.description || ""}
            onChange={(e) => setLevelForm((prev: Partial<LevelDTO>) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
            rows={3}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Порядок</span>
          <input
            type="number"
            min="0"
            value={levelForm.order ?? ""}
            onChange={(e) => setLevelForm((prev: Partial<LevelDTO>) => ({ ...prev, order: Number(e.target.value) }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={levelForm.isPublished ?? true}
            onChange={(e) => setLevelForm((prev: Partial<LevelDTO>) => ({ ...prev, isPublished: e.target.checked }))}
            className="rounded"
          />
          <span>Опубликован</span>
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
          disabled={saving || !levelForm.title?.trim() || !Number.isFinite(Number(levelForm.order))}
          className="rounded-[16px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}