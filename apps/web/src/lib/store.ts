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
    name: 'Defesa de Mestrado',
    description: 'VANTs, simulação, OGUM framework',
    due_cards: 2,
    total_cards: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deck-2',
    name: 'TypeScript',
    description: 'Tipos, generics, utility types',
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
    front: 'O que é o algoritmo FSRS-6?',
    back: 'Free Spaced Repetition Scheduler v6. Usa duas variáveis por card — Stability (S) e Difficulty (D) — para calcular o intervalo ideal de revisão.',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date().toISOString(),   // vence agora → aparece primeiro
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    front: 'O que é Stability (S) no FSRS?',
    back: 'Número de dias após o qual a probabilidade de recall cai a ~90%. Cresce a cada revisão bem-sucedida.',
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
    front: 'Qual a fórmula da curva de esquecimento?',
    back: 'R(t, S) = (1 + FACTOR × t/S)^DECAY\n\nOnde DECAY = -0.5 e FACTOR = 19/81 ≈ 0.2346',
    state: 2,           // Review — já revisado antes
    stability: 30,      // revisão daqui 30 dias
    difficulty: 5,
    due: new Date(Date.now() + 30 * 86_400_000).toISOString(), // vence em 30 dias
    lastReview: new Date().toISOString(),
    lapses: 0,
    reps: 3,
  },
  // deck-2
  {
    id: 'card-4',
    deckId: 'deck-2',
    front: 'Qual a diferença entre `type` e `interface` no TypeScript?',
    back: '`interface` é extensível (pode ser redeclarada e mergeada). `type` é mais flexível (unions, intersections, mapped types). Para objetos, prefira `interface`. Para tudo mais, use `type`.',
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
    front: 'O que faz `Awaited<T>` no TypeScript?',
    back: 'Extrai o tipo resolvido de uma Promise.\n\n```ts\ntype A = Awaited<Promise<string>>; // string\ntype B = Awaited<Promise<Promise<number>>>; // number\n```',
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date(Date.now() + 7 * 86_400_000).toISOString(), // vence em 7 dias
    lastReview: null,
    lapses: 0,
    reps: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retorna o próximo card a revisar num deck (due <= agora), ou null se não houver. */
export function getNextCard(deckId: string): Card | null {
  const now = new Date();
  return (
    cards.find(
      (c) => c.deckId === deckId && new Date(c.due) <= now
    ) ?? null
  );
}

/** Atualiza um card pelo id. */
export function updateCard(id: string, patch: Partial<Card>): Card | null {
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  cards[idx] = { ...cards[idx], ...patch };
  return cards[idx];
}
