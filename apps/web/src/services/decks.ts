import { api } from './api';
import type { Deck, Card, PreviewIntervals } from '@mnemosine/core';

export const listDecks = () =>
  api.get<{ decks: Deck[] }>('/decks').then((r) => r.decks);

export const createDeck = (body: { name: string; description?: string }) =>
  api.post<{ deck: Deck }>('/decks', body).then((r) => r.deck);

export const getNextCard = (deckId: string) =>
  api.get<{ card: Card | null }>(`/decks/${deckId}/next`).then((r) => r.card);

export const getPreviewIntervals = (deckId: string, cardId: string) =>
  api.get<PreviewIntervals>(`/decks/${deckId}/preview?cardId=${cardId}`);
