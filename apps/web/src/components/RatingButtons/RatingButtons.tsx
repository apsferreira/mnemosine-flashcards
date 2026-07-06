import type { PreviewIntervals, Rating } from '../../types';
import styles from './RatingButtons.module.css';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  preview: PreviewIntervals;
  disabled: boolean;
}

function formatInterval(days: number): string {
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 60) return `${minutes}min`;
    return `${Math.round(minutes / 60)}h`;
  }
  if (days === 1) return '1 dia';
  if (days < 30) return `${Math.round(days)} dias`;
  if (days < 365) return `${Math.round(days / 30)} meses`;
  return `${Math.round(days / 365)} anos`;
}

const BUTTONS: Array<{
  rating: Rating;
  label: string;
  styleClass: string;
  shortcut: string;
  ariaLabel: string;
}> = [
  { rating: 1, label: 'Novamente', styleClass: styles['again'] ?? '', shortcut: '1', ariaLabel: 'Novamente (tecla 1)' },
  { rating: 2, label: 'Difícil',   styleClass: styles['hard']  ?? '', shortcut: '2', ariaLabel: 'Difícil (tecla 2)' },
  { rating: 3, label: 'Bom',       styleClass: styles['good']  ?? '', shortcut: '3', ariaLabel: 'Bom (tecla 3)' },
  { rating: 4, label: 'Fácil',     styleClass: styles['easy']  ?? '', shortcut: '4', ariaLabel: 'Fácil (tecla 4)' },
];

export function RatingButtons({ onRate, preview, disabled }: RatingButtonsProps) {
  return (
    <div
      className={styles.container}
      role="group"
      aria-label="Avalie sua memória deste card"
    >
      {BUTTONS.map(({ rating, label, styleClass, shortcut, ariaLabel }) => (
        <button
          key={rating}
          className={`${styles.button} ${styleClass}`}
          onClick={() => onRate(rating)}
          disabled={disabled}
          aria-label={`${ariaLabel} — próxima revisão em ${formatInterval(preview[rating])}`}
        >
          <span className={styles.label}>{label}</span>
          <span className={styles.interval}>{formatInterval(preview[rating])}</span>
          <span className={styles.shortcut} aria-hidden="true">{shortcut}</span>
        </button>
      ))}
    </div>
  );
}
