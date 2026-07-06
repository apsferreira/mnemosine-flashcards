import api from './api';
import type { GlobalStats, ReviewRequest } from '../types';

export interface ReviewResponse {
  cardId: string;
  nextDue: string;
  intervalDays: number;
}

export async function submitReview(payload: ReviewRequest): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>('/reviews', payload);
  return data;
}

interface StatsAPIResponse {
  due_total: number
  total_learning: number
  total_review: number
  total_mature: number
  retention_rate: number
  streak_days: number
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const { data } = await api.get<StatsAPIResponse>('/stats')
  return {
    dueToday: data.due_total ?? 0,
    learning: data.total_learning ?? 0,
    review: data.total_review ?? 0,
    mature: data.total_mature ?? 0,
    retentionRate: data.retention_rate ?? 0,
    streak: data.streak_days ?? 0,
  }
}
