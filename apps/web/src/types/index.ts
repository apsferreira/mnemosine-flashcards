export type CardState = 0 | 1 | 2 | 3; // New/Learning/Review/Relearning
export type Rating = 1 | 2 | 3 | 4;    // Again/Hard/Good/Easy

export interface Card {
  id: string;
  noteId: string;
  deckId: string;
  state: CardState;
  stability: number | null;
  difficulty: number | null;
  due: string; // ISO datetime
  lastReview: string | null;
  lapses: number;
  reps: number;
  front: string;
  back: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  // campos retornados diretamente pela API (snake_case mapeado no deckService)
  due_cards: number;
  total_cards: number;
  stats?: DeckStats; // opcional — preenchido pelo getDeckStats separado
}

export interface DeckStats {
  dueToday: number;
  learning: number;
  review: number;
  mature: number; // stability > 21 dias
  retentionRate: number; // 0-100
}

export interface ReviewRequest {
  cardId: string;
  rating: Rating;
  durationMs: number;
}

export interface PreviewIntervals {
  1: number; // days for Again
  2: number; // days for Hard
  3: number; // days for Good
  4: number; // days for Easy
}

export interface GlobalStats {
  dueToday: number;
  learning: number;
  review: number;
  mature: number;
  retentionRate: number;
  streak: number;
}

export interface SessionStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  durationMs: number;
}
