interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  accent?: 'default' | 'again' | 'hard' | 'good' | 'easy';
}

const accentColors: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: '#6366f1',
  again: 'var(--accent-again)',
  hard: 'var(--accent-hard)',
  good: 'var(--accent-good)',
  easy: 'var(--accent-easy)',
};

export function StatCard({ label, value, description, accent = 'default' }: StatCardProps) {
  const color = accentColors[accent];

  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)]"
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
        {label}
      </span>
      <span
        className="text-3xl font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
      {description && (
        <span className="text-xs text-[var(--text-secondary)]">{description}</span>
      )}
    </div>
  );
}
