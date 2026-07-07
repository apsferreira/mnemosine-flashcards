import { NextRequest, NextResponse } from 'next/server';
import type { Deck } from '@mnemosine/core';

/**
 * In-memory store — substituto do banco de dados para desenvolvimento.
 *
 * Por que funciona? No Next.js dev server, este módulo é carregado uma vez
 * e mantido em memória entre requests (desde que o servidor não reinicie).
 *
 * Em produção com banco real, este array vira:
 *   const decks = await prisma.deck.findMany()
 *
 * A INTERFACE da rota não muda — só a fonte dos dados.
 */
const store: Deck[] = [
  {
    id: 'deck-1',
    name: 'Defesa de Mestrado',
    description: 'Conceitos para a defesa — VANTs, simulação, OGUM',
    due_cards: 12,
    total_cards: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deck-2',
    name: 'TypeScript',
    description: 'Tipos, generics, utility types',
    due_cards: 3,
    total_cards: 20,
    createdAt: new Date().toISOString(),
  },
];

// GET /api/decks — retorna todos os decks
export async function GET() {
  return NextResponse.json({ decks: store });
}

// POST /api/decks — cria um novo deck
export async function POST(req: NextRequest) {
  const body = await req.json() as { name?: string; description?: string };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const deck: Deck = {
    id: `deck-${Date.now()}`,           // em produção: UUID do banco
    name: body.name.trim(),
    description: body.description?.trim() ?? '',
    due_cards: 0,
    total_cards: 0,
    createdAt: new Date().toISOString(),
  };

  store.push(deck);                      // em produção: prisma.deck.create()

  return NextResponse.json({ deck }, { status: 201 });
}
