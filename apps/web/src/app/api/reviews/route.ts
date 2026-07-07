import { NextRequest, NextResponse } from 'next/server';
import { schedule } from '@mnemosine/core';
import type { Rating, CardState } from '@mnemosine/core';

/**
 * POST /api/reviews
 *
 * The core of the SRS loop:
 * 1. Receive { cardId, rating, durationMs }
 * 2. Load the card from DB
 * 3. Run FSRS-6 schedule() — pure function from @mnemosine/core
 * 4. Save the updated card state + new review record
 * 5. Return the updated card
 *
 * This is where TypeScript shines: the Rating type (1|2|3|4) prevents
 * invalid values at compile time, not just runtime.
 */

interface ReviewBody {
  cardId: string;
  rating: Rating;
  durationMs: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as ReviewBody;

  if (!body.cardId || ![1, 2, 3, 4].includes(body.rating)) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  // TODO: load card from DB
  // const card = await prisma.card.findUniqueOrThrow({ where: { id: body.cardId } })

  // Stub card for demonstration — replace with real DB lookup
  const stubCard = {
    state: 0 as CardState,
    stability: 0,
    difficulty: 0,
    step: 0,
    lapses: 0,
    reps: 0,
    lastReview: null,
  };

  // FSRS-6 scheduling — pure TypeScript, no side effects
  const next = schedule(stubCard, body.rating, new Date());

  // TODO: update card in DB + insert review record
  // await prisma.$transaction([
  //   prisma.card.update({ where: { id: body.cardId }, data: { ...next } }),
  //   prisma.review.create({ data: { cardId: body.cardId, rating: body.rating, durationMs: body.durationMs } }),
  // ])

  return NextResponse.json({ card: next });
}
