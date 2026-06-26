"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/lib/user-context";
import type { SectionDTO, CardDTO, LevelDTO } from "@/lib/types";
import AdminLayout from "@/components/AdminLayout";
import AdminHeader from "@/components/AdminHeader";
import Sidebar from "@/components/Sidebar";
import { Layers, Folder, BookOpen, Edit2, Trash2 } from "@/components/icons";

const fetcher = (u: string) => fetch(u).then((r) => r.json());
const EMOJIS = ["📁","🎯","🃏","🐶","🐱","🍎","🚗","🏠"];

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: levelsData, mutate: mutateLevels } = useSWR<{ levels: LevelDTO[] }>("/api/levels", fetcher);
  const levels = levelsData?.levels ?? [];
  const { data: sectionsData, mutate: mutateSections } = useSWR<{ sections: SectionDTO[] }>(
    activeLevel ? `/api/sections?levelId=${activeLevel}` : "/api/sections",
    fetcher
  );
  const sections = sectionsData?.sections ?? [];
  const { data: cardsData, mutate: mutateCards } = useSWR<{ cards: CardDTO[] }>(
    activeSection ? `/api/cards?sectionId=${activeSection}` : null,
    fetcher
  );
  const cards = cardsData?.cards ?? [];

  const [sectionForm, setSectionForm] = useState<Partial<SectionDTO>>({ emoji: "📁" });
  const [levelForm, setLevelForm] = useState<Partial<LevelDTO>>({ emoji: "🎯", number: 1 });
  const [cardForm, setCardForm] = useState<Partial<CardDTO>>({ emoji: "🃏" });
  const [uploading, setUploading] = useState(false);

  const [pixabayKey, setPixabayKey] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Initialize pixabayKey from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pixabay_key") || "";
      setPixabayKey(stored);
    }
  }, []);

  const savePixabayKey = (key: string) => {
    setPixabayKey(key);
    localStorage.setItem("pixabay_key", key);
  };

  function openSearch(initialWord: string) {
    setSearchQuery(initialWord || "");
    setSearchResults([]);
    setSearchError("");
    setIsSearchOpen(true);
    if (initialWord && pixabayKey) {
      triggerSearch(initialWord);
    }
  }

  async function triggerSearch(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/admin/search-images?q=${encodeURIComponent(q)}&key=${pixabayKey}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.message || "Ошибка при поиске картинок");
      } else {
        setSearchResults(data.images || []);
      }
    } catch {
      setSearchError("Не удалось подключиться к серверу поиска");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") return <main className="p-6 text-sm text-[var(--ink-soft)]">Загрузка...</main>;

  async function saveSection() {
    if (!sectionForm.name?.trim()) return;
    const levelId = sectionForm.levelId || activeLevel;
    if (!levelId) return;

    const payload: any = {
      name: sectionForm.name.trim(),
      nameKz: sectionForm.nameKz?.trim() || "",
      emoji: sectionForm.emoji || "📁",
      levelId,
    };

    if (sectionForm.id) {
      await fetch(`/api/sections/${sectionForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  async function saveLevel() {
    if (!levelForm.name?.trim()) return;
    const payload: any = {
      name: levelForm.name.trim(),
      nameKz: levelForm.nameKz?.trim() || "",
      emoji: levelForm.emoji || "🎯",
      number: typeof levelForm.number === "number" ? levelForm.number : 1,
    };

    if (levelForm.id) {
      await fetch(`/api/levels/${levelForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setLevelForm({ emoji: "🎯", number: 1 });
    mutateLevels();
  }

  async function deleteLevel(id: string) {
    if (!confirm("Удалить уровень? Это также удалит все его разделы и карточки.")) return;
    await fetch(`/api/levels/${id}`, { method: "DELETE" });
    if (activeLevel === id) setActiveLevel(null);
    mutateLevels();
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
      gifUrl: cardForm.gifUrl ?? null,
      audioRuUrl: cardForm.audioRuUrl ?? null,
      audioKzUrl: cardForm.audioKzUrl ?? null,
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

  const handleHome = () => router.push("/");
  const handleAddLevel = () => setLevelForm({ emoji: "🎯", number: (levels.length ? Math.max(...levels.map((lvl) => lvl.number)) + 1 : 1) });
  const handleAddSection = () => setSectionForm({ emoji: "📁", levelId: activeLevel || undefined });
  const handleAddCard = () => setCardForm({ emoji: "🃏" });

  return (
    <AdminLayout sidebar={<Sidebar levels={levels} sections={sections} activeLevel={activeLevel} activeSection={activeSection} onSelectLevel={(id) => { setActiveLevel(id); setActiveSection(null); }} onSelectSection={(id) => { setActiveSection(id); setCardForm({ emoji: "🃏" }); }} />}>
      <div>
        <AdminHeader title="Панель управления" breadcrumbs={["Dashboard", "Admin"]} onHome={handleHome} onAddLevel={handleAddLevel} onAddSection={handleAddSection} onAddCard={handleAddCard} />

        <div className="bg-transparent">
          <div className="bg-white rounded-[16px] border border-[var(--line)] p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[20px] font-bold">{activeSection ? `Карточки раздела: ${sections.find(s => s.id === activeSection)?.name ?? "-"}` : "Выберите раздел"}</h2>
                <p className="text-sm text-[var(--ink-soft)]">Редактирование карточек и содержимого</p>
              </div>
            </div>

            {activeSection ? (
              <>
                {cards.length === 0 ? (
                  <div className="py-12 text-center text-[var(--ink-soft)] border-2 border-dashed border-[var(--line)] rounded-md">
                    В этом разделе ещё нет карточек. Создайте первую карточку.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((c: CardDTO) => (
                      <div key={c.id} className="bg-white rounded-[16px] p-4 border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">
                            <BookOpen size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{c.ru}</div>
                            <div className="text-xs text-[var(--ink-soft)]">{c.kz}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setCardForm(c)} className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"><Edit2 size={16} /></button>
                            <button onClick={() => deleteCard(c.id)} className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 bg-white rounded-[12px] border border-[var(--line)] p-4">
                  <h3 className="text-base font-bold mb-3">{cardForm.id ? "Редактировать карточку" : "Добавить карточку"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Слово на русском" value={cardForm.ru || ""} onChange={e => setCardForm({...cardForm, ru: e.target.value})} className="w-full border border-[var(--line)] rounded-md p-2" />
                    <input placeholder="Слово на казахском" value={cardForm.kz || ""} onChange={e => setCardForm({...cardForm, kz: e.target.value})} className="w-full border border-[var(--line)] rounded-md p-2" />
                  </div>
                  <div className="flex gap-3 justify-end mt-4">
                    <button onClick={() => setCardForm({ emoji: "🃏" })} className="px-4 py-2 rounded-md bg-gray-100">Отмена</button>
                    <button onClick={saveCard} className="px-4 py-2 rounded-md bg-[var(--accent)] text-white">Сохранить</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-[var(--ink-soft)]">
                Выберите раздел в левой панели, чтобы увидеть карточки и редактировать их.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
