/**
 * In-memory store — fonte de dados compartilhada entre todas as rotas da API.
 *
 * Por que um módulo separado?
 * Se cada route.ts tivesse seu próprio array, seriam arrays DIFERENTES.
 * Um módulo exportado é carregado uma vez pelo Node.js e reutilizado.
 *
 * Substituição por banco real:
 * Quando conectar Prisma, este arquivo some — cada rota chama `prisma.deck.findMany()`.
 * A interface das rotas (GET /api/decks, POST /api/decks) não muda.
 */

import type { Deck, Card } from '@mnemosine/core';

// ─── Decks ────────────────────────────────────────────────────────────────────

export const decks: Deck[] = [
  {
    id: 'deck-1',
    name: "Master's Thesis Defense",
    description: 'UAVs, simulation, OGUM framework',
    due_cards: 2,
    total_cards: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deck-2',
    name: 'TypeScript',
    description: 'Types, generics, utility types',
    due_cards: 1,
    total_cards: 2,
    createdAt: new Date().toISOString(),
  },
];

// ─── Cards ────────────────────────────────────────────────────────────────────

export const cards: Card[] = [
  // deck-1
  {
    id: 'card-1',
    deckId: 'deck-1',
    front: 'What is the FSRS-6 algorithm?',
    back: 'Free Spaced Repetition Scheduler v6. Uses two variables per card — Stability (S) and Difficulty (D) — to calculate the optimal review interval.',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date().toISOString(),
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    front: 'What is Stability (S) in FSRS?',
    back: 'The number of days after which recall probability drops to ~90%. It grows with each successful review.',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date().toISOString(),
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
  {
    id: 'card-3',
    deckId: 'deck-1',
    front: 'What is the forgetting curve formula?',
    back: 'R(t, S) = (1 + FACTOR × t/S)^DECAY\n\nWhere DECAY = -0.5 and FACTOR = 19/81 ≈ 0.2346',
    state: 2,
    stability: 30,
    difficulty: 5,
    due: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    lastReview: new Date().toISOString(),
    lapses: 0,
    reps: 3,
  },
  // deck-2
  {
    id: 'card-4',
    deckId: 'deck-2',
    front: 'What is the difference between `type` and `interface` in TypeScript?',
    back: '`interface` is extensible (can be redeclared and merged). `type` is more flexible (unions, intersections, mapped types). For objects, prefer `interface`. For everything else, use `type`.',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date().toISOString(),
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
  {
    id: 'card-5',
    deckId: 'deck-2',
    front: 'What does `Awaited<T>` do in TypeScript?',
    back: 'Extracts the resolved type from a Promise.\n\n```ts\ntype A = Awaited<Promise<string>>; // string\ntype B = Awaited<Promise<Promise<number>>>; // number\n```',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the next card due for review in a deck (due <= now), or null if none. */
export function getNextCard(deckId: string): Card | null {
  const now = new Date();
  return (
    cards.find(
      (c) => c.deckId === deckId && new Date(c.due) <= now
    ) ?? null
  );
}

/** Updates a card by id. */
export function updateCard(id: string, patch: Partial<Card>): Card | null {
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  cards[idx] = { ...cards[idx], ...patch };
  return cards[idx];
}
