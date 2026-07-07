import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js App Router — API Route handlers
 *
 * Each file in app/api/ exports HTTP method functions.
 * No separate server needed — this runs on Node.js inside Next.js.
 *
 * Learning path:
 * 1. GET  /api/decks  → list all decks with due_cards count
 * 2. POST /api/decks  → create a new deck
 *
 * TODO: connect to PostgreSQL using Prisma
 *   npm install prisma @prisma/client
 *   npx prisma init
 *   Then replace the stubs below with real DB calls.
 */

export async function GET(_req: NextRequest) {
  // TODO: const decks = await prisma.deck.findMany({ include: { _count: { select: { cards: { where: { due: { lte: new Date() } } } } } } })
  return NextResponse.json({ decks: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { name?: string; description?: string };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // TODO: const deck = await prisma.deck.create({ data: { name: body.name, description: body.description } })
  return NextResponse.json({ deck: null }, { status: 501 });
}
