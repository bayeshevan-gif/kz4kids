export type SectionDTO = {
  id: string;
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
  order: number;
  learned: boolean;
};

export type TestQuestionDTO = {
  card: CardDTO;
  options: CardDTO[];
};
