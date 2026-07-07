'use client';

/**
 * Study page — /study/[deckId]
 *
 * Next.js App Router: [deckId] is a dynamic segment.
 * useParams() from 'next/navigation' replaces useParams() from react-router-dom.
 * useRouter() from 'next/navigation' replaces useNavigate().
 */

import { useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashCard } from '@/components/FlashCard/FlashCard';
import { RatingButtons } from '@/components/RatingButtons/RatingButtons';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { useStudySession } from '@/store/studySession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getNextCard, getPreviewIntervals } from '@/services/decks';
import { submitReview } from '@/services/reviews';
import type { PreviewIntervals, Rating } from '@mnemosine/core';

const FALLBACK_PREVIEW: PreviewIntervals = { 1: 0.007, 2: 0.125, 3: 1, 4: 4 };

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const cardStartTime = useRef<number>(Date.now());

  const {
    currentCard, revealed, totalDueToday, completedCards, sessionStats,
    setCurrentCard, setRevealed, setTotalDueToday, recordRating, resetSession,
  } = useStudySession();

  const { data: nextCard, isLoading, isError, refetch } = useQuery({
    queryKey: ['nextCard', deckId],
    queryFn: () => getNextCard(deckId),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: preview } = useQuery({
    queryKey: ['preview', deckId, currentCard?.id],
    queryFn: () => getPreviewIntervals(deckId, currentCard!.id),
    enabled: !!currentCard,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (nextCard !== undefined) {
      setCurrentCard(nextCard ?? null);
      if (nextCard && totalDueToday === 0) setTotalDueToday(completedCards + 1);
      cardStartTime.current = Date.now();
    }
  }, [nextCard, setCurrentCard, totalDueToday, completedCards, setTotalDueToday]);

  useEffect(() => {
    resetSession();
    return () => {
      void qc.invalidateQueries({ queryKey: ['globalStats'] });
      void qc.invalidateQueries({ queryKey: ['decks'] });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => void refetch(),
  });

  const handleReveal = useCallback(() => setRevealed(true), [setRevealed]);
  const handleBack = useCallback(() => router.push('/'), [router]);
  const handleRate = useCallback((rating: Rating) => {
    if (!currentCard || reviewMutation.isPending) return;
    recordRating(rating);
    reviewMutation.mutate({ cardId: currentCard.id, rating, durationMs: Date.now() - cardStartTime.current });
  }, [currentCard, reviewMutation, recordRating]);

  useKeyboardShortcuts({ revealed, onReveal: handleReveal, onRate: handleRate, onBack: handleBack, disabled: reviewMutation.isPending });

  if (isLoading && !currentCard) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (isError) {
    return <p className="text-red-500 text-sm text-center py-8">Failed to load cards.</p>;
  }

  // Session complete
  if (currentCard === null && completedCards > 0) {
    const retention = sessionStats.reviewed > 0
      ? Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100)
      : 0;
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="text-5xl">✓</div>
        <h2 className="text-xl font-bold text-gray-900">Session complete!</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { label: 'Reviewed', value: sessionStats.reviewed },
            { label: 'Retained', value: `${retention}%` },
            { label: 'Again', value: sessionStats.again },
            { label: 'Easy', value: sessionStats.easy },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-2xl border border-gray-200 bg-white">
              <p className="text-2xl font-bold text-indigo-500">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
        <button onClick={handleBack} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          Back to decks
        </button>
      </div>
    );
  }

  if (currentCard === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">All caught up!</h2>
        <p className="text-sm text-gray-400">No cards due for this deck.</p>
        <button onClick={handleBack} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold">Back to decks</button>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <div className="flex-1">
          <ProgressBar completed={completedCards} total={Math.max(totalDueToday, completedCards + 1)} />
        </div>
        <span className="text-xs text-gray-400">{completedCards}/{Math.max(totalDueToday, completedCards + 1)}</span>
      </div>

      <FlashCard card={currentCard} revealed={revealed} onReveal={handleReveal} />

      {revealed && (
        <RatingButtons onRate={handleRate} preview={preview ?? FALLBACK_PREVIEW} disabled={reviewMutation.isPending} />
      )}
    </div>
  );
}
