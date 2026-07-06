import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '../../components/StatCard/StatCard';
import { listDecks } from '../../services/deckService';
import { getGlobalStats } from '../../services/reviewService';
import type { Deck } from '../../types';
import styles from './DashboardPage.module.css';

function RetentionBar({ rate, goal = 92 }: { rate: number; goal?: number }) {
  return (
    <div className={styles.retentionRow} role="region" aria-label="Taxa de retenção">
      <div className={styles.retentionLabel}>
        <span>Retenção</span>
        <span className={styles.retentionValue}>{rate.toFixed(1)}%</span>
      </div>
      <div className={styles.retentionBar}>
        <div
          className={styles.retentionFill}
          style={{ width: `${Math.min(100, rate)}%` }}
          role="progressbar"
          aria-valuenow={rate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Retenção atual: ${rate.toFixed(1)}%`}
        />
      </div>
      <span className={styles.retentionMeta}>meta: {goal}%</span>
    </div>
  );
}

function DeckRow({ deck }: { deck: Deck }) {
  const navigate = useNavigate();
  const dueCount = deck.due_cards ?? deck.stats?.dueToday ?? 0;
  const hasDue = dueCount > 0;

  return (
    <div className={styles.deckCard} role="listitem">
      <div className={styles.deckInfo}>
        <span className={styles.deckName}>{deck.name}</span>
        <span className={styles.deckMeta}>
          {hasDue
            ? `${dueCount} card${dueCount !== 1 ? 's' : ''} para revisar`
            : 'Em dia'}
        </span>
      </div>
      <button
        className={`${styles.studyButton} ${!hasDue ? styles.studyButtonDone : ''}`}
        onClick={() => navigate(`/study/${deck.id}`)}
        aria-label={
          hasDue
            ? `Estudar deck ${deck.name} — ${dueCount} cards pendentes`
            : `Ver deck ${deck.name} — em dia`
        }
      >
        {hasDue ? 'Estudar' : 'Ver'}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['globalStats'],
    queryFn: getGlobalStats,
    staleTime: 30_000,
  });

  const { data: decks, isLoading: decksLoading, isError: decksError } = useQuery({
    queryKey: ['decks'],
    queryFn: listDecks,
    staleTime: 30_000,
  });

  const isLoading = statsLoading || decksLoading;
  const isError = statsError || decksError;

  if (isLoading) {
    return (
      <div className={styles.loading} aria-busy="true" aria-label="Carregando dashboard">
        <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className={styles.error} role="alert">
        Erro ao carregar dados. Verifique sua conexão e tente novamente.
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Streak */}
      {stats.streak > 0 && (
        <div
          className={styles.streakBadge}
          aria-label={`Sequência de ${stats.streak} dia${stats.streak !== 1 ? 's' : ''}`}
        >
          <span aria-hidden="true">🔥</span>
          {stats.streak} dia{stats.streak !== 1 ? 's' : ''} seguido{stats.streak !== 1 ? 's' : ''}
        </div>
      )}

      {/* Stats grid */}
      <section className={styles.section} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>Hoje</h2>
        <div className={styles.statsGrid}>
          <StatCard
            label="Para hoje"
            value={stats.dueToday}
            description="cards vencidos"
            accent="default"
          />
          <StatCard
            label="Aprendendo"
            value={stats.learning}
            description="em progresso"
            accent="hard"
          />
          <StatCard
            label="Em revisão"
            value={stats.review}
            description="intervalo ativo"
            accent="easy"
          />
          <StatCard
            label="Maduros"
            value={stats.mature}
            description="estabilidade > 21d"
            accent="good"
          />
        </div>
      </section>

      {/* Retenção */}
      <section className={styles.section} aria-labelledby="retention-heading">
        <h2 id="retention-heading" className={styles.sectionTitle}>Retenção</h2>
        <RetentionBar rate={stats.retentionRate} goal={92} />
      </section>

      {/* Decks */}
      <section className={styles.section} aria-labelledby="decks-heading">
        <h2 id="decks-heading" className={styles.sectionTitle}>
          Decks {decks ? `(${decks.length})` : ''}
        </h2>
        {!decks || decks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Nenhum deck encontrado.
          </p>
        ) : (
          <div className={styles.deckList} role="list" aria-label="Lista de decks">
            {decks.map((deck) => (
              <DeckRow key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
