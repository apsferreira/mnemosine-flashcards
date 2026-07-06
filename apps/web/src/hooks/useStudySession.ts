import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Card, Rating, SessionStats } from '../types';

interface StudySessionState {
  currentCard: Card | null;
  revealed: boolean;
  totalDueToday: number;
  completedCards: number;
  startTime: number;
  sessionStats: SessionStats;

  setCurrentCard: (card: Card | null) => void;
  setRevealed: (revealed: boolean) => void;
  setTotalDueToday: (total: number) => void;
  recordRating: (rating: Rating) => void;
  resetSession: () => void;
}

const initialSessionStats: SessionStats = {
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
  durationMs: 0,
};

const useStudySessionStore = create<StudySessionState>((set) => ({
  currentCard: null,
  revealed: false,
  totalDueToday: 0,
  completedCards: 0,
  startTime: Date.now(),
  sessionStats: { ...initialSessionStats },

  setCurrentCard: (card) =>
    set({ currentCard: card, revealed: false }),

  setRevealed: (revealed) =>
    set({ revealed }),

  setTotalDueToday: (total) =>
    set({ totalDueToday: total }),

  recordRating: (rating) =>
    set((state) => {
      const prev = state.sessionStats;
      const updated: SessionStats = {
        reviewed:   prev.reviewed + 1,
        again:      prev.again   + (rating === 1 ? 1 : 0),
        hard:       prev.hard    + (rating === 2 ? 1 : 0),
        good:       prev.good    + (rating === 3 ? 1 : 0),
        easy:       prev.easy    + (rating === 4 ? 1 : 0),
        durationMs: Date.now() - state.startTime,
      };
      return {
        completedCards: state.completedCards + 1,
        sessionStats: updated,
      };
    }),

  resetSession: () =>
    set({
      currentCard: null,
      revealed: false,
      totalDueToday: 0,
      completedCards: 0,
      startTime: Date.now(),
      sessionStats: { ...initialSessionStats },
    }),
}));

export function useStudySession() {
  return useStudySessionStore(
    useShallow((s) => ({
      currentCard: s.currentCard,
      revealed: s.revealed,
      totalDueToday: s.totalDueToday,
      completedCards: s.completedCards,
      sessionStats: s.sessionStats,
      setCurrentCard: s.setCurrentCard,
      setRevealed: s.setRevealed,
      setTotalDueToday: s.setTotalDueToday,
      recordRating: s.recordRating,
      resetSession: s.resetSession,
    }))
  );
}
