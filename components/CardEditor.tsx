"use client";
import React from "react";
import type { CardDTO } from "@/lib/types";

type Props = {
  cardForm: Partial<CardDTO>;
  setCardForm: React.Dispatch<React.SetStateAction<Partial<CardDTO>>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
};

export default function CardEditor({ cardForm, setCardForm, onSave, onCancel, uploading }: Props) {
  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">{cardForm.id ? "Редактировать карточку" : "Создать карточку"}</h2>
          <p className="text-sm text-[var(--ink-soft)]">Заполните основные поля и сохраните изменения.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Слово на русском</span>
          <input
            type="text"
            value={cardForm.ru || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, ru: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Слово на казахском</span>
          <input
            type="text"
            value={cardForm.kz || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, kz: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Эмодзи</span>
          <input
            type="text"
            value={cardForm.emoji || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, emoji: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Ссылка на изображение</span>
          <input
            type="text"
            value={cardForm.imageUrl || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="rounded-[16px] border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] transition hover:border-[var(--accent-dark)]">
          Отмена
        </button>
        <button
          onClick={onSave}
          disabled={uploading}
          className="rounded-[16px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
