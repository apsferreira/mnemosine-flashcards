import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashCard } from '../../components/FlashCard/FlashCard';
import { RatingButtons } from '../../components/RatingButtons/RatingButtons';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { useStudySession } from '../../hooks/useStudySession';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { getNextCard, getPreviewIntervals } from '../../services/deckService';
import { submitReview } from '../../services/reviewService';
import type { PreviewIntervals, Rating } from '../../types';
import styles from './StudyPage.module.css';

const FALLBACK_PREVIEW: PreviewIntervals = { 1: 0.007, 2: 0.125, 3: 1, 4: 4 };

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cardStartTime = useRef<number>(Date.now());

  const {
    currentCard,
    revealed,
    totalDueToday,
    completedCards,
    sessionStats,
    setCurrentCard,
    setRevealed,
    setTotalDueToday,
    recordRating,
    resetSession,
  } = useStudySession();

  // Fetch next card
  const {
    data: nextCard,
    isLoading: isLoadingCard,
    isError: isCardError,
    refetch: refetchCard,
  } = useQuery({
    queryKey: ['nextCard', deckId],
    queryFn: () => getNextCard(deckId!),
    enabled: !!deckId,
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch preview intervals when card is known
  const { data: preview } = useQuery({
    queryKey: ['preview', deckId, currentCard?.id],
    queryFn: () => getPreviewIntervals(deckId!, currentCard!.id),
    enabled: !!deckId && !!currentCard,
    staleTime: 0,
    gcTime: 0,
  });

  // Sync fetched card into Zustand
  useEffect(() => {
    if (nextCard !== undefined) {
      setCurrentCard(nextCard);
      if (nextCard !== null && totalDueToday === 0) {
        // First card: set total; this is an estimate from the initial fetch
        setTotalDueToday(completedCards + 1);
      }
      cardStartTime.current = Date.now();
    }
  }, [nextCard, setCurrentCard, totalDueToday, completedCards, setTotalDueToday]);

  // Update total estimate as we complete cards (simple heuristic)
  useEffect(() => {
    if (completedCards >= totalDueToday && totalDueToday > 0) {
      setTotalDueToday(completedCards + 1);
    }
  }, [completedCards, totalDueToday, setTotalDueToday]);

  // Reset session on mount
  useEffect(() => {
    resetSession();
    return () => {
      // Invalidate stats cache on unmount so dashboard refreshes
      void queryClient.invalidateQueries({ queryKey: ['globalStats'] });
      void queryClient.invalidateQueries({ queryKey: ['decks'] });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      void refetchCard();
    },
  });

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, [setRevealed]);

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentCard || reviewMutation.isPending) return;
      recordRating(rating);
      reviewMutation.mutate({
        cardId: currentCard.id,
        rating,
        durationMs: Date.now() - cardStartTime.current,
      });
    },
    [currentCard, reviewMutation, recordRating]
  );

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useKeyboardShortcuts({
    revealed,
    onReveal: handleReveal,
    onRate: handleRate,
    onBack: handleBack,
    disabled: reviewMutation.isPending,
  });

  if (!deckId) {
    return (
      <div className={styles.error} role="alert">
        Deck não encontrado.
      </div>
    );
  }

  if (isLoadingCard && !currentCard) {
    return (
      <div className={styles.loading} aria-busy="true" aria-label="Carregando card">
        <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isCardError) {
    return (
      <div className={styles.error} role="alert">
        Erro ao carregar cards. Verifique sua conexão.
      </div>
    );
  }

  // Session complete
  if (currentCard === null && completedCards > 0) {
    const retentionPct =
      sessionStats.reviewed > 0
        ? Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100)
        : 0;

    return (
      <div className={styles.complete} role="main" aria-label="Sessão de estudo concluída">
        <div aria-hidden="true" style={{ fontSize: '3rem' }}>✓</div>
        <h1 className={styles.completeTitle}>Sessão concluída!</h1>
        <div className={styles.completeStats}>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue}>{sessionStats.reviewed}</span>
            <span className={styles.completeStatLabel}>cards revistos</span>
          </div>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue}>{retentionPct}%</span>
            <span className={styles.completeStatLabel}>recordado</span>
          </div>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue} style={{ color: 'var(--accent-again)' }}>
              {sessionStats.again}
            </span>
            <span className={styles.completeStatLabel}>novamente</span>
          </div>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue} style={{ color: 'var(--accent-easy)' }}>
              {sessionStats.easy}
            </span>
            <span className={styles.completeStatLabel}>fáceis</span>
          </div>
        </div>
        <button className={styles.backButton} onClick={handleBack}>
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // No cards due at all (empty state on first load)
  if (currentCard === null && completedCards === 0 && !isLoadingCard) {
    return (
      <div className={styles.complete} role="main">
        <h1 className={styles.completeTitle}>Nada para revisar!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Todos os cards deste deck estão em dia.
        </p>
        <button className={styles.backButton} onClick={handleBack}>
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className={styles.page}>
      <ProgressBar
        completed={completedCards}
        total={Math.max(totalDueToday, completedCards + 1)}
      />

      <div className={styles.cardArea}>
        <FlashCard
          card={currentCard}
          revealed={revealed}
          onReveal={handleReveal}
        />
      </div>

      {revealed && (
        <div className={styles.ratingArea}>
          <RatingButtons
            onRate={handleRate}
            preview={preview ?? FALLBACK_PREVIEW}
            disabled={reviewMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
