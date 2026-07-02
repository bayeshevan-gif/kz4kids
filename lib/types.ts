export type LevelDTO = {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  totalCards: number;
  learnedCards: number;
  totalLessons: number;
  completedLessons: number;
  unlocked?: boolean;
  finished?: boolean;
};

export type SectionDTO = {
  id: string;
  name: string;
  nameKz: string;
  emoji: string;
  order: number;
  totalCards: number;
  learnedCards: number;
  levelIds?: string[];
  levelId?: string;
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
  audioUrl: string | null;
  audioFileName: string | null;
  audioDuration: number | null;
  order: number;
  learned: boolean;
};

export type TestQuestionDTO = {
  card: CardDTO;
  options: CardDTO[];
};
