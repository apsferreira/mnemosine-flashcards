import { api } from './api';
import type { Card, Rating } from '@mnemosine/core';

export const submitReview = (body: { cardId: string; rating: Rating; durationMs: number }) =>
  api.post<{ card: Card }>('/reviews', body).then((r) => r.card);
