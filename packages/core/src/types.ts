// Tipos centrais do domínio Mnemosine — compartilhados entre web, api e mobile

export type CardState = 0 | 1 | 2 | 3; // New | Learning | Review | Relearning
export type Rating    = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy

export interface Deck {
  id: string;
  name: string;
  description: string;
  due_cards: number;
  total_cards: number;
  createdAt: string;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  state: CardState;
  stability: number | null;
  difficulty: number | null;
  due: string;
  lastReview: string | null;
  lapses: number;
  reps: number;
}

export interface ReviewRequest {
  cardId: string;
  rating: Rating;
  durationMs: number;
}

export interface PreviewIntervals {
  1: number; // Again → days
  2: number; // Hard  → days
  3: number; // Good  → days
  4: number; // Easy  → days
}

export interface DeckStats {
  dueToday: number;
  learning: number;
  review: number;
  mature: number;
  retentionRate: number;
}

export interface GlobalStats extends DeckStats {
  streak: number;
}
