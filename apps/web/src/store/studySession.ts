import { create } from 'zustand';
import type { Card, Rating } from '@mnemosine/core';

interface SessionStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface StudySessionState {
  currentCard: Card | null;
  revealed: boolean;
  completedCards: number;
  totalDueToday: number;
  sessionStats: SessionStats;
  setCurrentCard: (card: Card | null) => void;
  setRevealed: (v: boolean) => void;
  setTotalDueToday: (n: number) => void;
  recordRating: (rating: Rating) => void;
  resetSession: () => void;
}

const defaultStats: SessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };

export const useStudySession = create<StudySessionState>((set) => ({
  currentCard: null,
  revealed: false,
  completedCards: 0,
  totalDueToday: 0,
  sessionStats: defaultStats,

  setCurrentCard: (card) => set({ currentCard: card, revealed: false }),
  setRevealed: (revealed) => set({ revealed }),
  setTotalDueToday: (totalDueToday) => set({ totalDueToday }),

  recordRating: (rating) =>
    set((s) => ({
      completedCards: s.completedCards + 1,
      sessionStats: {
        ...s.sessionStats,
        reviewed: s.sessionStats.reviewed + 1,
        again: s.sessionStats.again + (rating === 1 ? 1 : 0),
        hard:  s.sessionStats.hard  + (rating === 2 ? 1 : 0),
        good:  s.sessionStats.good  + (rating === 3 ? 1 : 0),
        easy:  s.sessionStats.easy  + (rating === 4 ? 1 : 0),
      },
    })),

  resetSession: () =>
    set({ currentCard: null, revealed: false, completedCards: 0, totalDueToday: 0, sessionStats: defaultStats }),
}));
