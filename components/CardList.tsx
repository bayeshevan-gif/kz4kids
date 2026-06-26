"use client";
import React from "react";
import { BookOpen, Edit2, Trash2 } from "@/components/icons";
import type { CardDTO } from "@/lib/types";

type Props = {
  cards: CardDTO[];
  onEdit: (card: CardDTO) => void;
  onDelete: (id: string) => void;
};

export default function CardList({ cards, onEdit, onDelete }: Props) {
  return (
    <div className="w-full min-w-0 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {cards.map((card) => (
        <article key={card.id} className="flex w-full min-w-0 min-h-0 flex-col overflow-hidden rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-4 flex items-start gap-4 min-w-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--accent-soft)] text-2xl flex-shrink-0">
              {card.emoji || "🃏"}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[var(--ink)] truncate">{card.ru}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)] truncate">{card.kz}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 text-sm text-[var(--ink-soft)] min-w-0">
            {card.imageUrl ? (
              <div className="rounded-[16px] bg-gray-50 p-4 text-sm break-words">Изображение добавлено</div>
            ) : (
              <div className="rounded-[16px] bg-gray-50 p-4 text-sm break-words">Нет изображения</div>
            )}
          </div>
          <div className="mt-5 flex gap-2 pt-4">
            <button onClick={() => onEdit(card)} className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent-dark)]">
              <Edit2 size={16} /> Ред.
            </button>
            <button onClick={() => onDelete(card.id)} className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--ink-dark)] transition hover:bg-[var(--accent)] hover:text-white">
              <Trash2 size={16} /> Удалить
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
