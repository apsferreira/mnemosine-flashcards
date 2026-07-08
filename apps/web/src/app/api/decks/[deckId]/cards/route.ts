import { NextRequest, NextResponse } from "next/server";
import { decks, cards } from "@/lib/store";
import type { Card } from "@mnemosine/core";

type Params = { params: Promise<{ deckId: string }> };

// GET /api/decks/:deckId/cards — list all cards in a deck
export async function GET(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;

  if (!decks.find((d) => d.id === deckId)) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const deckCards = cards.filter((c) => c.deckId === deckId);
  return NextResponse.json({ cards: deckCards });
}

// POST /api/decks/:deckId/cards — create a new card in a deck
export async function POST(req: NextRequest, { params }: Params) {
  const { deckId } = await params;

  if (!decks.find((d) => d.id === deckId)) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const body = (await req.json()) as { front?: string; back?: string };

  if (!body.front?.trim() || !body.back?.trim()) {
    return NextResponse.json({ error: "front and back are required" }, { status: 400 });
  }

  const card: Card = {
    id: `card-${Date.now()}`,
    deckId,
    front: body.front.trim(),
    back: body.back.trim(),
    state: 0,
    stability: null,
    difficulty: null,
    due: new Date().toISOString(),
    lastReview: null,
    lapses: 0,
    reps: 0,
  };

  cards.push(card);
  return NextResponse.json({ card }, { status: 201 });
}
