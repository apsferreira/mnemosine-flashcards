import { NextRequest, NextResponse } from "next/server";
import { decks, cards } from "@/lib/store";
import type { Deck } from "@mnemosine/core";

// GET /api/decks — retorna todos os decks com contagens calculadas dos cards
export async function GET() {
  const now = new Date();
  const enriched = decks.map((deck) => {
    const deckCards = cards.filter((c) => c.deckId === deck.id);
    const dueCards  = deckCards.filter((c) => new Date(c.due) <= now);
    return { ...deck, total_cards: deckCards.length, due_cards: dueCards.length };
  });
  return NextResponse.json({ decks: enriched });
}

// POST /api/decks — cria um novo deck
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; description?: string };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const deck: Deck = {
    id: `deck-${Date.now()}`,
    name: body.name.trim(),
    description: body.description?.trim() ?? "",
    due_cards: 0,
    total_cards: 0,
    createdAt: new Date().toISOString(),
  };

  decks.push(deck);
  return NextResponse.json({ deck }, { status: 201 });
}
