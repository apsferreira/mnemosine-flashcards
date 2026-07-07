'use client';

import ReactMarkdown from 'react-markdown';
import type { Card } from '@mnemosine/core';

interface FlashCardProps {
  card: Card;
  revealed: boolean;
  onReveal: () => void;
}

export function FlashCard({ card, revealed, onReveal }: FlashCardProps) {
  return (
    <div className="w-full">
      <article
        className="w-full min-h-64 rounded-2xl border border-gray-200 bg-white shadow-sm p-8 flex flex-col gap-4"
        aria-label={revealed ? 'Card revealed' : 'Card front'}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Question
        </span>
        <div className="prose prose-sm max-w-none text-gray-800 flex-1">
          <ReactMarkdown>{card.front}</ReactMarkdown>
        </div>

        {!revealed ? (
          <button
            onClick={onReveal}
            className="mt-4 w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Show answer
            <span className="ml-2 text-indigo-200 text-xs">Space</span>
          </button>
        ) : (
          <>
            <hr className="border-gray-100" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Answer
            </span>
            <div className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown>{card.back}</ReactMarkdown>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
