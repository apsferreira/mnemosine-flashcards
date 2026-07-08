import { api } from './api';
import type { Card } from '@mnemosine/core';

export const listCards = (deckId: string) =>
  api.get<{ cards: Card[] }>(`/decks/${deckId}/cards`).then((r) => r.cards);

export const createCard = (deckId: string, body: { front: string; back: string }) =>
  api.post<{ card: Card }>(`/decks/${deckId}/cards`, body).then((r) => r.card);
