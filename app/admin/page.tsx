"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/lib/user-context";
import type { SectionDTO, CardDTO } from "@/lib/types";

const fetcher = (u: string) => fetch(u).then((r) => r.json());
const EMOJIS = ["📁","🔢","👪","🐾","🎨","🍎","🚗","🏠","📚","⚽","🎵","🌳","🐱","🐶","🟡","🟢","1️⃣","2️⃣"];

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

  const [newSecName, setNewSecName] = useState("");
  const [newSecNameKz, setNewSecNameKz] = useState("");
  const [newSecEmoji, setNewSecEmoji] = useState("📁");

  const [cardForm, setCardForm] = useState<Partial<CardDTO> & { editing?: boolean }>({ emoji: "🃏" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") return <main className="p-6 text-sm">Загрузка...</main>;

  async function addSection() {
    if (!newSecName.trim()) return;
    await fetch("/api/sections", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSecName, nameKz: newSecNameKz, emoji: newSecEmoji }) });
    setNewSecName(""); setNewSecNameKz(""); setNewSecEmoji("📁");
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
    const payload = { sectionId: activeSection, ru: cardForm.ru, kz: cardForm.kz,
      emoji: cardForm.emoji || "🃏", imageUrl: cardForm.imageUrl ?? null, gifUrl: cardForm.gifUrl ?? null };
    if (cardForm.id) {
      await fetch(`/api/cards/${cardForm.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setCardForm({ emoji: "🃏" });
    mutateCards(); mutateSections();
  }
  async function deleteCard(id: string) {
    if (!confirm("Удалить карточку?")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    mutateCards(); mutateSections();
  }

  return (
    <main className="px-4 pt-4 max-w-[480px] mx-auto pb-24">
      <h1 className="text-2xl font-extrabold mb-4">Админ-панель</h1>

      <section className="mb-6">
        <h2 className="font-bold mb-2">Разделы</h2>
        <div className="flex flex-col gap-2 mb-3">
          {sections.map((s: SectionDTO) => (
            <div key={s.id} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer ${activeSection===s.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-white"}`}
              onClick={() => setActiveSection(s.id)}>
              <span className="text-xl">{s.emoji}</span>
              <span className="flex-1 font-bold text-sm">{s.name} <span className="text-xs text-[var(--ink-soft)]">({s.totalCards})</span></span>
              <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }} className="text-xs bg-[var(--bad-soft)] text-[var(--bad)] rounded-lg px-2 py-1">Удалить</button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 border-2 border-dashed border-[var(--line)]">
          <input placeholder="Название (рус)" value={newSecName} onChange={e=>setNewSecName(e.target.value)} className="w-full border rounded-lg p-2 mb-2 text-sm" />
          <input placeholder="Название (қаз)" value={newSecNameKz} onChange={e=>setNewSecNameKz(e.target.value)} className="w-full border rounded-lg p-2 mb-2 text-sm" />
          <div className="flex flex-wrap gap-1 mb-2">
            {EMOJIS.map(em => <button key={em} onClick={()=>setNewSecEmoji(em)} className={`w-8 h-8 rounded-lg border-2 ${newSecEmoji===em?"border-[var(--accent)]":"border-[var(--line)]"}`}>{em}</button>)}
          </div>
          <button onClick={addSection} className="w-full bg-[var(--accent)] text-white rounded-lg py-2 font-bold text-sm">+ Добавить раздел</button>
        </div>
      </section>

      {activeSection && (
        <section>
          <h2 className="font-bold mb-2">Карточки раздела</h2>
          <div className="flex flex-col gap-2 mb-3">
            {cards.map((c: CardDTO) => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[var(--line)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-lg overflow-hidden">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.ru} className="w-full h-full object-cover" />
                  ) : (
                    c.emoji
                  )}
                </div>
                <div className="flex-1 text-sm"><b>{c.ru}</b> — {c.kz}</div>
                <button onClick={()=>setCardForm({...c, editing:true})} className="text-xs bg-blue-100 rounded-lg px-2 py-1">✏️</button>
                <button onClick={()=>deleteCard(c.id)} className="text-xs bg-[var(--bad-soft)] text-[var(--bad)] rounded-lg px-2 py-1">🗑️</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-3 border-2 border-dashed border-[var(--line)]">
            <input placeholder="Слово (рус)" value={cardForm.ru||""} onChange={e=>setCardForm({...cardForm, ru:e.target.value})} className="w-full border rounded-lg p-2 mb-2 text-sm" />
            <input placeholder="Слово (қаз)" value={cardForm.kz||""} onChange={e=>setCardForm({...cardForm, kz:e.target.value})} className="w-full border rounded-lg p-2 mb-2 text-sm" />
            <input type="file" accept="image/*" disabled={uploading} onChange={async e=>{
              const f = e.target.files?.[0]; if(!f) return;
              const url = await handleUpload(f);
              if (url) setCardForm({...cardForm, imageUrl:url});
            }} className="text-xs mb-2 block" />
            {uploading && <p className="text-xs text-[var(--ink-soft)] mb-2">Загрузка...</p>}
            <div className="flex flex-wrap gap-1 mb-2">
              {EMOJIS.map(em => <button key={em} onClick={()=>setCardForm({...cardForm, emoji:em})} className={`w-8 h-8 rounded-lg border-2 ${cardForm.emoji===em?"border-[var(--accent)]":"border-[var(--line)]"}`}>{em}</button>)}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setCardForm({emoji:"🃏"})} className="flex-1 bg-gray-100 rounded-lg py-2 text-sm font-bold">Отмена</button>
              <button onClick={saveCard} className="flex-1 bg-[var(--accent)] text-white rounded-lg py-2 text-sm font-bold">Сохранить</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
