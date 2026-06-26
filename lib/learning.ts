import type { Card } from "@prisma/client";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildLessons<T extends { sectionId: string }>(cards: T[], lessonSize = 5): T[][] {
  if (cards.length === 0) return [];

  const sectionOrder: string[] = [];
  const buckets = new Map<string, T[]>();
  for (const card of cards) {
    if (!buckets.has(card.sectionId)) {
      sectionOrder.push(card.sectionId);
      buckets.set(card.sectionId, []);
    }
    buckets.get(card.sectionId)!.push(card);
  }

  const sections = sectionOrder.map((sectionId) => ({
    sectionId,
    cards: buckets.get(sectionId)!.slice(),
  }));

  const lessons: T[][] = [];
  while (sections.some((section) => section.cards.length > 0)) {
    const lesson: T[] = [];
    for (const section of sections) {
      if (lesson.length >= lessonSize) break;
      if (section.cards.length > 0) {
        lesson.push(section.cards.shift()!);
      }
    }
    for (const section of sections) {
      if (lesson.length >= lessonSize) break;
      if (section.cards.length > 0) {
        lesson.push(section.cards.shift()!);
      }
    }
    lessons.push(lesson);
  }

  return lessons;
}

export function cardsToDTO(card: Card & { learned: boolean }) {
  return {
    id: card.id,
    sectionId: card.sectionId,
    ru: card.ru,
    kz: card.kz,
    emoji: card.emoji,
    imageUrl: card.imageUrl,
    gifUrl: card.gifUrl,
    audioRuUrl: card.audioRuUrl,
    audioKzUrl: card.audioKzUrl,
    order: card.order,
    learned: card.learned,
  };
}
