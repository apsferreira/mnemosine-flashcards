'use client';

import type { PreviewIntervals, Rating } from '@mnemosine/core';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  preview: PreviewIntervals;
  disabled: boolean;
}

function formatInterval(days: number): string {
  if (days < 1) {
    const mins = Math.round(days * 24 * 60);
    return mins < 60 ? `${mins}min` : `${Math.round(mins / 60)}h`;
  }
  if (days === 1) return '1 dia';
  if (days < 30) return `${Math.round(days)} dias`;
  if (days < 365) return `${Math.round(days / 30)} meses`;
  return `${Math.round(days / 365)} anos`;
}

const BUTTONS: Array<{ rating: Rating; label: string; color: string; shortcut: string }> = [
  { rating: 1, label: 'Novamente', color: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',     shortcut: '1' },
  { rating: 2, label: 'Difícil',   color: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100', shortcut: '2' },
  { rating: 3, label: 'Bom',       color: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',   shortcut: '3' },
  { rating: 4, label: 'Fácil',     color: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',    shortcut: '4' },
];

export function RatingButtons({ onRate, preview, disabled }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 w-full" role="group" aria-label="Avalie sua memória">
      {BUTTONS.map(({ rating, label, color, shortcut }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-medium transition-colors disabled:opacity-50 ${color}`}
          aria-label={`${label} — próxima revisão em ${formatInterval(preview[rating])}`}
        >
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs opacity-70">{formatInterval(preview[rating])}</span>
          <span className="text-xs opacity-40">{shortcut}</span>
        </button>
      ))}
    </div>
  );
}
