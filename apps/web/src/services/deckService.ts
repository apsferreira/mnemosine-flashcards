import api from './api';
import type { Card, Deck, DeckStats, PreviewIntervals } from '../types';

export async function listDecks(): Promise<Deck[]> {
  const { data } = await api.get<{ decks: Deck[]; total: number }>('/decks');
  return data.decks ?? [];
}

export async function createDeck(payload: { name: string; description: string }): Promise<Deck> {
  const { data } = await api.post<Deck>('/decks', payload);
  return data;
}

export async function getDeckStats(deckId: string): Promise<DeckStats> {
  const { data } = await api.get<DeckStats>(`/decks/${deckId}/stats`);
  return data;
}

export async function getNextCard(deckId: string): Promise<Card | null> {
  const { data } = await api.get<Card | null>(`/decks/${deckId}/next`);
  return data;
}

export async function getPreviewIntervals(
  deckId: string,
  cardId: string
): Promise<PreviewIntervals> {
  const { data } = await api.get<PreviewIntervals>(`/decks/${deckId}/preview`, {
    params: { cardId },
  });
  return data;
}
