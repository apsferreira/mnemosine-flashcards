import { useEffect } from 'react';
import type { Rating } from '@mnemosine/core';

interface Options {
  revealed: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onBack: () => void;
  disabled: boolean;
}

export function useKeyboardShortcuts({ revealed, onReveal, onRate, onBack, disabled }: Options) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) onReveal();
      }
      if (revealed && !disabled) {
        if (e.key === '1') onRate(1);
        if (e.key === '2') onRate(2);
        if (e.key === '3') onRate(3);
        if (e.key === '4') onRate(4);
      }
      if (e.key === 'Escape') onBack();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, onReveal, onRate, onBack, disabled]);
}
