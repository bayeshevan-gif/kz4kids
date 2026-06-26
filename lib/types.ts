export type LevelDTO = {
  id: string;
  name: string;
  nameKz: string;
  emoji: string;
  number: number;
  order: number;
  totalCards: number;
  learnedCards: number;
  totalLessons: number;
  completedLessons: number;
  unlocked?: boolean;
  finished?: boolean;
};

export type SectionDTO = {
  id: string;
  levelId: string;
  levelName?: string;
  cardsPerLesson?: number;
  name: string;
  nameKz: string;
  emoji: string;
  order: number;
  totalCards: number;
  learnedCards: number;
};

export type CardDTO = {
  id: string;
  sectionId: string;
  ru: string;
  kz: string;
  emoji: string;
  imageUrl: string | null;
  gifUrl: string | null;
  audioRuUrl: string | null;
  audioKzUrl: string | null;
  order: number;
  learned: boolean;
};

export type TestQuestionDTO = {
  card: CardDTO;
  options: CardDTO[];
};
