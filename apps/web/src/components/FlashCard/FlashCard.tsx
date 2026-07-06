import ReactMarkdown from 'react-markdown';
import type { Card } from '../../types';
import styles from './FlashCard.module.css';

interface FlashCardProps {
  card: Card;
  revealed: boolean;
  onReveal: () => void;
}

export function FlashCard({ card, revealed, onReveal }: FlashCardProps) {
  return (
    <div className={styles.scene}>
      <article
        className={`${styles.card} ${revealed ? styles.revealed : ''}`}
        role="article"
        aria-label={revealed ? 'Card revelado — frente e verso visíveis' : 'Frente do card'}
      >
        {/* Frente — visível antes de revelar */}
        <div className={styles.face} aria-hidden={revealed}>
          <span className={styles.label} aria-hidden="true">Pergunta</span>
          <div className={styles.content}>
            <ReactMarkdown>{card.front}</ReactMarkdown>
          </div>
          <button
            className={styles.revealButton}
            onClick={onReveal}
            tabIndex={revealed ? -1 : 0}
            aria-label="Revelar resposta — pressione Espaço"
          >
            Revelar resposta
          </button>
          <span className={styles.revealHint} aria-hidden="true">
            pressione Espaço
          </span>
        </div>

        {/* Verso — visível após revelar, mostra frente + divider + verso */}
        <div className={`${styles.face} ${styles.back}`} aria-hidden={!revealed}>
          <span className={styles.label} aria-hidden="true">Pergunta</span>
          <div className={styles.content}>
            <ReactMarkdown>{card.front}</ReactMarkdown>
          </div>
          <div className={styles.divider} role="separator" aria-hidden="true" />
          <span className={styles.label} aria-hidden="true">
            Resposta
          </span>
          <div className={`${styles.content} ${styles.contentAnswer}`}>
            <ReactMarkdown>{card.back}</ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
