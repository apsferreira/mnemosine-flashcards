import { useEffect } from 'react';
import type { Rating } from '../types';

interface UseKeyboardShortcutsProps {
  revealed: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onBack: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  revealed,
  onReveal,
  onRate,
  onBack,
  disabled = false,
}: UseKeyboardShortcutsProps): void {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (!revealed) {
            onReveal();
          }
          break;
        case '1':
          if (revealed) onRate(1);
          break;
        case '2':
          if (revealed) onRate(2);
          break;
        case '3':
          if (revealed) onRate(3);
          break;
        case '4':
          if (revealed) onRate(4);
          break;
        case 'Escape':
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, onReveal, onRate, onBack, disabled]);
}
