import { NextRequest, NextResponse } from "next/server";
import { decks } from "@/lib/store";

type Params = { params: Promise<{ deckId: string }> };

// PATCH /api/decks/:deckId — update a deck's name or description
export async function PATCH(req: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const body = (await req.json()) as { name?: string; description?: string };

  const idx = decks.findIndex((d) => d.id === deckId);
  if (idx === -1) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  // Only update the fields that were sent
  if (body.name?.trim()) decks[idx].name = body.name.trim();
  if (body.description !== undefined) decks[idx].description = body.description.trim();

  return NextResponse.json({ deck: decks[idx] });
}

// DELETE /api/decks/:deckId — remove a deck
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;

  const idx = decks.findIndex((d) => d.id === deckId);
  if (idx === -1) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  decks.splice(idx, 1);  // remove 1 element at position idx

  return new NextResponse(null, { status: 204 }); // 204 = success, no content
}
