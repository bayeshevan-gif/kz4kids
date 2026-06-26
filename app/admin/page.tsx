"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/lib/user-context";
import type { SectionDTO, CardDTO, LevelDTO } from "@/lib/types";
import AdminLayout from "@/components/AdminLayout";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import SectionList from "@/components/SectionList";
import CardList from "@/components/CardList";
import CardEditor from "@/components/CardEditor";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

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

  if (loading || !user || user.role !== "ADMIN") {
    return <main className="p-6 text-sm text-[var(--ink-soft)]">Загрузка...</main>;
  }

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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      return res.ok ? data.url : null;
    } finally {
      setUploading(false);
    }
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
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
  const handleAddLevel = () => setLevelForm({ emoji: "🎯", number: levels.length ? Math.max(...levels.map((lvl) => lvl.number)) + 1 : 1 });
  const handleAddSection = () => setSectionForm({ emoji: "📁", levelId: activeLevel || undefined });
  const handleAddCard = () => setCardForm({ emoji: "🃏" });

  return (
    <AdminLayout
      sidebar={
        <Sidebar
          levels={levels}
          sections={sections}
          activeLevel={activeLevel}
          activeSection={activeSection}
          onSelectLevel={(id) => {
            setActiveLevel(id);
            setActiveSection(null);
            setCardForm({ emoji: "🃏" });
          }}
          onSelectSection={(id) => {
            setActiveSection(id);
            setCardForm({ emoji: "🃏" });
          }}
        />
      }
    >
      <div className="space-y-8">
        <DashboardHeader
          counts={{ levels: levels.length, sections: sections.length, cards: cards.length }}
          onHome={handleHome}
          onAddLevel={handleAddLevel}
          onAddSection={handleAddSection}
          onAddCard={handleAddCard}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <SectionList sections={sections} activeSection={activeSection} onSelectSection={setActiveSection} />

            <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {activeSection ? `Карточки раздела: ${sections.find((s) => s.id === activeSection)?.name ?? "-"}` : "Выберите раздел для просмотра карточек"}
                  </h2>
                  <p className="text-sm text-[var(--ink-soft)]">Здесь отображаются карточки выбранного раздела.</p>
                </div>
              </div>

              {activeSection ? (
                cards.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-[var(--line)] bg-[var(--bg)] p-10 text-center text-[var(--ink-soft)]">
                    В этом разделе ещё нет карточек. Создайте первую карточку.
                  </div>
                ) : (
                  <CardList cards={cards} onEdit={(card) => setCardForm(card)} onDelete={deleteCard} />
                )
              ) : (
                <div className="rounded-[20px] border border-dashed border-[var(--line)] bg-[var(--bg)] p-10 text-center text-[var(--ink-soft)]">
                  Выберите раздел слева, чтобы увидеть и отредактировать карточки.
                </div>
              )}
            </div>
          </div>

          <CardEditor
            cardForm={cardForm}
            setCardForm={setCardForm}
            onSave={saveCard}
            onCancel={() => setCardForm({ emoji: "🃏" })}
            uploading={uploading}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
