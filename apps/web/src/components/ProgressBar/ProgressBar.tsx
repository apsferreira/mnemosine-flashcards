interface ProgressBarProps {
  completed: number;
  total: number;
  deckName?: string;
}

export function ProgressBar({ completed, total, deckName }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  return (
    <div className="w-full" role="region" aria-label="Progresso da sessão">
      <div className="flex items-center justify-between mb-1.5">
        {deckName && (
          <span className="text-xs font-medium text-[var(--text-secondary)] truncate max-w-[60%]">
            {deckName}
          </span>
        )}
        <span
          className="text-xs text-[var(--text-secondary)] ml-auto"
          aria-live="polite"
          aria-atomic="true"
        >
          {completed} / {total} hoje
        </span>
      </div>
      <div
        className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} de ${total} cards revistos hoje`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
          }}
        />
      </div>
    </div>
  );
}
