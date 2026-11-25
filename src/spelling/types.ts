export type PracticeMode =
  | "flashcards"
  | "builder"
  | "missing"
  | "cover"
  | "listen"
  | "test"
  | "tricky"
  | "mixed";
export type TurnMode =
  | "flashcards"
  | "builder"
  | "missing"
  | "cover"
  | "listen"
  | "test";
export type EvidenceKind = "recognition" | "assisted" | "independent" | "test";
// Adapted from SchoolWordList's Week/Word/Attempt model (MIT, J. Fang).
export type WeeklyWord = { id: string; text: string; sentence: string };
export type WeeklyList = {
  id: string;
  name: string;
  words: WeeklyWord[];
  testDate: string;
  archived: boolean;
  createdAt: number;
};
export type IndependentEvidence = {
  sessionId: string;
  at: number;
  correct: boolean;
};
export type WordProgress = {
  recognition: number;
  assisted: { attempts: number; correct: number };
  independent: { attempts: number; correct: number };
  test: { attempts: number; correct: number };
  independentHistory: IndependentEvidence[];
  lastSeen: number;
  lastMissed: number;
  nextReview: number;
};
export type PracticeItem = { word: WeeklyWord; listId: string; mode: TurnMode };
export type WordResult = {
  word: string;
  answer: string;
  correct: boolean;
  kind: EvidenceKind;
  at: number;
};
export type WeeklySession = {
  id: string;
  listId: string;
  listName: string;
  mode: PracticeMode;
  items: PracticeItem[];
  index: number;
  results: WordResult[];
  startedAt: number;
  assistedIndices: number[];
};
export type SessionResult = {
  id: string;
  listId: string;
  listName: string;
  mode: PracticeMode;
  results: WordResult[];
  finishedAt: number;
  stars: number;
};
export type WeeklyData = {
  version: 1;
  lists: WeeklyList[];
  activeListId: string | null;
  progress: Record<string, WordProgress>;
  current: WeeklySession | null;
  results: SessionResult[];
};
