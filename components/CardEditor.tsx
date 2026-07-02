"use client";
import React, { useState } from "react";
import type { CardDTO } from "@/lib/types";

type Props = {
  cardForm: Partial<CardDTO>;
  setCardForm: React.Dispatch<React.SetStateAction<Partial<CardDTO>>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
};

export default function CardEditor({ cardForm, setCardForm, onSave, onCancel, uploading }: Props) {
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingAudioRu, setUploadingAudioRu] = useState(false);
  const [uploadingAudioKz, setUploadingAudioKz] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isUploadingState = uploading || uploadingImg || uploadingAudioRu || uploadingAudioKz;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audioRu" | "audioKz") {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    if (type === "image") setUploadingImg(true);
    if (type === "audioRu") setUploadingAudioRu(true);
    if (type === "audioKz") setUploadingAudioKz(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Ошибка при загрузке файла");
      } else {
        if (type === "image") setCardForm((prev) => ({ ...prev, imageUrl: data.url }));
        if (type === "audioRu") setCardForm((prev) => ({ ...prev, audioRuUrl: data.url }));
        if (type === "audioKz") setCardForm((prev) => ({ ...prev, audioKzUrl: data.url }));
      }
    } catch {
      setErrorMsg("Ошибка подключения к серверу");
    } finally {
      setUploadingImg(false);
      setUploadingAudioRu(false);
      setUploadingAudioKz(false);
    }
  }

  function playPreview(url: string) {
    if (!url) return;
    try {
      const a = new Audio(url);
      a.play();
    } catch {
      alert("Не удалось воспроизвести аудиозапись");
    }
  }

  return (
    <div className="w-full min-w-0 rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          {cardForm.id ? "Редактировать карточку" : "Создать карточку"}
        </h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Заполните слова, выберите картинку и добавьте аудио-озвучку.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-red-50 text-red-600 rounded-[12px] font-bold border border-red-100">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Words Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-bold text-[var(--ink)]">
          <span>Слово на русском</span>
          <input
            type="text"
            value={cardForm.ru || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, ru: e.target.value }))}
            placeholder="Например: Яблоко"
            className="w-full rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
          />
        </label>
        <label className="space-y-1.5 text-sm font-bold text-[var(--ink)]">
          <span>Слово на казахском</span>
          <input
            type="text"
            value={cardForm.kz || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, kz: e.target.value }))}
            placeholder="Например: Алма"
            className="w-full rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
          />
        </label>
      </div>

      {/* Emoji & Image */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-bold text-[var(--ink)]">
          <span>Эмодзи (иконка)</span>
          <input
            type="text"
            value={cardForm.emoji || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, emoji: e.target.value }))}
            className="w-full rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
          />
        </label>
        <div className="space-y-1.5 text-sm font-bold text-[var(--ink)]">
          <span>Картинка</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={cardForm.imageUrl || ""}
              onChange={(e) => setCardForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="Ссылка на изображение"
              className="flex-1 rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
            />
            <label className="cursor-pointer bg-gray-50 border border-[var(--line)] px-3.5 py-2.5 rounded-[14px] text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center flex-shrink-0">
              <span>{uploadingImg ? "..." : "🖼️ Файл"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Russian Voiceover */}
      <div className="space-y-1.5 text-sm font-bold text-[var(--ink)] border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center">
          <span>Озвучка на русском</span>
          {cardForm.audioRuUrl && (
            <button
              type="button"
              onClick={() => playPreview(cardForm.audioRuUrl!)}
              className="px-2.5 py-0.5 bg-[var(--good-soft)] text-[var(--good)] text-[10px] font-black rounded-lg hover:brightness-95 transition"
            >
              ▶ Прослушать запись
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={cardForm.audioRuUrl || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, audioRuUrl: e.target.value }))}
            placeholder="Ссылка на MP3 файл"
            className="flex-1 rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
          />
          <label className="cursor-pointer bg-gray-50 border border-[var(--line)] px-3.5 py-2.5 rounded-[14px] text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center flex-shrink-0">
            <span>{uploadingAudioRu ? "..." : "🎙️ Загрузить"}</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange(e, "audioRu")}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Kazakh Voiceover */}
      <div className="space-y-1.5 text-sm font-bold text-[var(--ink)] border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center">
          <span>Озвучка на казахском</span>
          {cardForm.audioKzUrl && (
            <button
              type="button"
              onClick={() => playPreview(cardForm.audioKzUrl!)}
              className="px-2.5 py-0.5 bg-[var(--good-soft)] text-[var(--good)] text-[10px] font-black rounded-lg hover:brightness-95 transition"
            >
              ▶ Прослушать запись
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={cardForm.audioKzUrl || ""}
            onChange={(e) => setCardForm((prev) => ({ ...prev, audioKzUrl: e.target.value }))}
            placeholder="Ссылка на MP3 файл"
            className="flex-1 rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] outline-none transition focus:border-[var(--accent)] font-medium"
          />
          <label className="cursor-pointer bg-gray-50 border border-[var(--line)] px-3.5 py-2.5 rounded-[14px] text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center flex-shrink-0">
            <span>{uploadingAudioKz ? "..." : "🎙️ Загрузить"}</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange(e, "audioKz")}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end pt-2 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--ink)] transition hover:border-[var(--accent-dark)] cursor-pointer"
        >
          Отмена
        </button>
        <button
          onClick={onSave}
          disabled={isUploadingState}
          className="rounded-[14px] bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isUploadingState ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
