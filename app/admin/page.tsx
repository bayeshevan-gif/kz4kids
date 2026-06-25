"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/lib/user-context";
import type { SectionDTO, CardDTO } from "@/lib/types";

const fetcher = (u: string) => fetch(u).then((r) => r.json());
const EMOJIS = ["📁","🔢","👪","🐾","🎨","🍎","🚗","🏠","📚","⚽","🎵","🌳","🐱","🐶","🟢","🔵","🔴","🟡","1️⃣","2️⃣"];

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { data: sectionsData, mutate: mutateSections } = useSWR<{ sections: SectionDTO[] }>("/api/sections", fetcher);
  const sections = sectionsData?.sections ?? [];
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { data: cardsData, mutate: mutateCards } = useSWR<{ cards: CardDTO[] }>(
    activeSection ? `/api/cards?sectionId=${activeSection}` : null, fetcher
  );
  const cards = cardsData?.cards ?? [];

  const [sectionForm, setSectionForm] = useState<Partial<SectionDTO>>({ emoji: "📁" });
  const [cardForm, setCardForm] = useState<Partial<CardDTO>>({ emoji: "🃏" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") return <main className="p-6 text-sm text-[var(--ink-soft)]">Загрузка...</main>;

  async function saveSection() {
    if (!sectionForm.name?.trim()) return;
    const payload = { 
      name: sectionForm.name.trim(), 
      nameKz: sectionForm.nameKz?.trim() || "", 
      emoji: sectionForm.emoji || "📁" 
    };
    if (sectionForm.id) {
      await fetch(`/api/sections/${sectionForm.id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
    } else {
      await fetch("/api/sections", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
    }
    setSectionForm({ emoji: "📁" });
    mutateSections();
  }

  async function deleteSection(id: string) {
    if (!confirm("Удалить раздел и все карточки в нём?")) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    if (activeSection === id) setActiveSection(null);
    mutateSections();
  }

  async function handleUpload(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      return res.ok ? data.url : null;
    } finally { setUploading(false); }
  }

  async function saveCard() {
    if (!cardForm.ru?.trim() || !cardForm.kz?.trim() || !activeSection) return;
    const payload = { 
      sectionId: activeSection, 
      ru: cardForm.ru.trim(), 
      kz: cardForm.kz.trim(),
      emoji: cardForm.emoji || "🃏", 
      imageUrl: cardForm.imageUrl ?? null, 
      gifUrl: cardForm.gifUrl ?? null 
    };
    if (cardForm.id) {
      await fetch(`/api/cards/${cardForm.id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
    } else {
      await fetch("/api/cards", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
    }
    setCardForm({ emoji: "🃏" });
    mutateCards(); 
    mutateSections();
  }

  async function deleteCard(id: string) {
    if (!confirm("Удалить карточку?")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    mutateCards(); 
    mutateSections();
  }

  return (
    <main className="px-6 pt-6 max-w-6xl mx-auto pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-3xl font-black text-[var(--ink)]">Панель управления 🐻</h1>
          <p className="text-[var(--ink-soft)] text-sm mt-1">Редактирование разделов и обучающих карточек</p>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="rounded-xl border-2 border-[var(--line)] bg-white px-4 py-2 text-xs font-black text-[var(--ink-soft)] active:scale-95 transition-transform cursor-pointer"
        >
          🏠 На главную
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Колонки разделов (1/3 ширины на десктопе) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black mb-3 text-[var(--ink)]">Разделы</h2>
            <div className="flex flex-col gap-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
              {sections.map((s: SectionDTO) => (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    activeSection === s.id 
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]" 
                      : "border-[var(--line)] bg-white hover:border-[var(--accent-dark)]"
                  }`}
                  onClick={() => {
                    setActiveSection(s.id);
                    setCardForm({ emoji: "🃏" });
                  }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-[14px] truncate">{s.name}</div>
                    <div className="text-[11px] text-[var(--ink-soft)] font-bold">{s.nameKz || "Без каз. названия"}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setSectionForm(s)} 
                      className="text-xs bg-blue-50 text-blue-600 rounded-lg p-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => deleteSection(s.id)} 
                      className="text-xs bg-[var(--bad-soft)] text-[var(--bad)] rounded-lg p-1.5 hover:opacity-80 transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Форма разделов */}
          <div className="bg-white rounded-2xl p-4 border border-[var(--line)] card-shadow">
            <h3 className="font-black text-sm mb-3 text-[var(--ink)]">
              {sectionForm.id ? "Редактировать раздел" : "Добавить раздел"}
            </h3>
            <input 
              placeholder="Название (рус)" 
              value={sectionForm.name || ""} 
              onChange={e => setSectionForm({...sectionForm, name: e.target.value})} 
              className="w-full border-2 border-[var(--line)] rounded-lg p-2 mb-2 text-sm focus:border-[var(--accent)] outline-none" 
            />
            <input 
              placeholder="Название (қаз)" 
              value={sectionForm.nameKz || ""} 
              onChange={e => setSectionForm({...sectionForm, nameKz: e.target.value})} 
              className="w-full border-2 border-[var(--line)] rounded-lg p-2 mb-3 text-sm focus:border-[var(--accent)] outline-none" 
            />
            
            <label className="text-xs text-[var(--ink-soft)] font-extrabold mb-1.5 block">Иконка (Эмодзи)</label>
            <div className="flex flex-wrap gap-1 mb-4">
              {EMOJIS.map(em => (
                <button 
                  key={em} 
                  onClick={() => setSectionForm({...sectionForm, emoji: em})} 
                  className={`w-8 h-8 rounded-lg border-2 text-lg flex items-center justify-center cursor-pointer ${
                    sectionForm.emoji === em ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-white hover:bg-gray-50"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {sectionForm.id && (
                <button 
                  onClick={() => setSectionForm({ emoji: "📁" })} 
                  className="flex-1 bg-gray-100 text-[var(--ink-soft)] rounded-xl py-2.5 text-xs font-black cursor-pointer active:scale-95 transition-transform"
                >
                  Отмена
                </button>
              )}
              <button 
                onClick={saveSection} 
                className="flex-1 bg-[var(--accent)] text-white rounded-xl py-2.5 text-xs font-black card-shadow cursor-pointer active:scale-95 transition-transform"
              >
                {sectionForm.id ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>

        {/* Колонки карточек (2/3 ширины на десктопе) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeSection ? (
            <>
              <div>
                <h2 className="text-lg font-black mb-3 text-[var(--ink)]">
                  Карточки раздела: <span className="text-[var(--accent-dark)]">
                    {sections.find(s => s.id === activeSection)?.name}
                  </span>
                </h2>
                {cards.length === 0 ? (
                  <div className="bg-[var(--card)] card-shadow rounded-2xl p-8 text-center text-[var(--ink-soft)] border border-dashed border-[var(--line)]">
                    В этом разделе ещё нет карточек. Создай первую ниже!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {cards.map((c: CardDTO) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[var(--line)] card-shadow">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-2xl overflow-hidden flex-shrink-0 card-shadow border border-[var(--line)]">
                          {c.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.imageUrl} alt={c.ru} className="w-full h-full object-cover" />
                          ) : (
                            c.emoji
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-[14px] truncate text-[var(--ink)]">{c.ru}</div>
                          <div className="text-[12px] text-[var(--accent-dark)] font-bold truncate">{c.kz}</div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setCardForm(c)} 
                            className="text-xs bg-blue-50 text-blue-600 rounded-lg p-2 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => deleteCard(c.id)} 
                            className="text-xs bg-[var(--bad-soft)] text-[var(--bad)] rounded-lg p-2 hover:opacity-85 transition-colors cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Форма создания/редактирования карточки */}
              <div className="bg-white rounded-2xl p-4 border border-[var(--line)] card-shadow">
                <h3 className="font-black text-sm mb-3 text-[var(--ink)]">
                  {cardForm.id ? "Редактировать карточку" : "Добавить карточку в раздел"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input 
                    placeholder="Слово на русском" 
                    value={cardForm.ru || ""} 
                    onChange={e => setCardForm({...cardForm, ru: e.target.value})} 
                    className="w-full border-2 border-[var(--line)] rounded-lg p-2 text-sm focus:border-[var(--accent)] outline-none" 
                  />
                  <input 
                    placeholder="Слово на казахском" 
                    value={cardForm.kz || ""} 
                    onChange={e => setCardForm({...cardForm, kz: e.target.value})} 
                    className="w-full border-2 border-[var(--line)] rounded-lg p-2 text-sm focus:border-[var(--accent)] outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Загрузка картинки */}
                  <div>
                    <label className="text-xs text-[var(--ink-soft)] font-extrabold mb-1.5 block">Загрузить изображение (вместо эмодзи)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={uploading} 
                        onChange={async e => {
                          const f = e.target.files?.[0]; if(!f) return;
                          const url = await handleUpload(f);
                          if (url) setCardForm({...cardForm, imageUrl: url});
                        }} 
                        className="text-xs text-[var(--ink-soft)] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[var(--accent-soft)] file:text-[var(--accent-dark)] cursor-pointer" 
                      />
                      {cardForm.imageUrl && (
                        <button 
                          onClick={() => setCardForm({...cardForm, imageUrl: undefined})}
                          className="text-[10px] text-[var(--bad)] font-bold underline cursor-pointer"
                        >
                          Сбросить
                        </button>
                      )}
                    </div>
                    {uploading && <p className="text-xs text-[var(--accent)] font-bold mt-1">Загрузка изображения...</p>}
                  </div>

                  {/* Выбор эмодзи */}
                  <div>
                    <label className="text-xs text-[var(--ink-soft)] font-extrabold mb-1.5 block">Или выбрать эмодзи (по умолчанию)</label>
                    <div className="flex flex-wrap gap-1">
                      {EMOJIS.map(em => (
                        <button 
                          key={em} 
                          onClick={() => setCardForm({...cardForm, emoji: em})} 
                          className={`w-8 h-8 rounded-lg border-2 text-lg flex items-center justify-center cursor-pointer ${
                            cardForm.emoji === em ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-white hover:bg-gray-50"
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setCardForm({ emoji: "🃏" })} 
                    className="bg-gray-100 text-[var(--ink-soft)] rounded-xl py-2.5 px-6 text-xs font-black cursor-pointer active:scale-95 transition-transform"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={saveCard} 
                    className="bg-[var(--accent)] text-white rounded-xl py-2.5 px-8 text-xs font-black card-shadow cursor-pointer active:scale-95 transition-transform"
                  >
                    {cardForm.id ? "Сохранить карточку" : "Сохранить"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-[var(--ink-soft)] border-2 border-dashed border-[var(--line)] card-shadow flex flex-col items-center justify-center min-h-[400px]">
              <span className="text-[60px] mb-3">👈</span>
              <h2 className="text-lg font-black text-[var(--ink)]">Выберите раздел</h2>
              <p className="text-sm text-[var(--ink-soft)] mt-1">Чтобы увидеть список карточек и редактировать их, выберите раздел в левой панели.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
