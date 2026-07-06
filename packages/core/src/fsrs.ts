/**
 * FSRS-6 — Free Spaced Repetition Scheduler (TypeScript port)
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 *
 * Pure functions — no side effects, no database access.
 * All scheduling is deterministic given (card, rating, reviewedAt, weights).
 */

import type { CardState, Rating } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default 19-weight vector for FSRS-6 */
export const DEFAULT_WEIGHTS: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, // w[0..3]: S0 per rating (Again/Hard/Good/Easy)
  7.1949, 0.5345,                     // w[4..5]: initial difficulty
  1.4604, 0.0046,                     // w[6..7]: difficulty update
  1.54575, 0.1192, 1.01925,           // w[8..10]: stability after recall
  1.9395, 0.11, 0.29605, 2.2698,      // w[11..14]: stability after lapse
  0.2315, 2.9898,                     // w[15..16]: Hard/Easy modifiers
  0.51655, 0.6621,                    // w[17..18]: same-day reviews
];

/** Forgetting curve: R(t, S) = (1 + FACTOR * t/S)^DECAY */
const DECAY = -0.5;
const FACTOR = 19 / 81; // ≈ 0.23457

/** Default target retention rate */
export const DESIRED_RETENTION = 0.92;

/** Intra-day learning steps in minutes */
export const LEARNING_STEPS = [1, 10];

/** Intra-day relearning steps in minutes */
export const RELEARNING_STEPS = [10];

// ─── Pure calculations ─────────────────────────────────────────────────────────

/**
 * Probability of recall after `elapsedDays` with stability `s`.
 * Returns 1.0 if stability is 0 (card never reviewed).
 */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 1;
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
}

/** Initial stability S0(rating) = w[rating - 1] */
export function initialStability(rating: Rating, w = DEFAULT_WEIGHTS): number {
  return w[rating - 1];
}

/** Initial difficulty D0(rating) = w[4] - e^(w[5]*(rating-1)) + 1, clamped to [1, 10] */
export function initialDifficulty(rating: Rating, w = DEFAULT_WEIGHTS): number {
  const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
  return clampDifficulty(d);
}

/** Update difficulty after a review */
export function updateDifficulty(d: number, rating: Rating, w = DEFAULT_WEIGHTS): number {
  const delta = -w[6] * (rating - 3);
  const dPrime = d + delta * ((10 - d) / 9);
  const d0Easy = initialDifficulty(4, w);
  const dDoublePrime = w[7] * d0Easy + (1 - w[7]) * dPrime;
  return clampDifficulty(dDoublePrime);
}

/** New stability after a successful recall */
export function stabilityAfterRecall(
  d: number,
  s: number,
  r: number,
  rating: Rating,
  w = DEFAULT_WEIGHTS,
): number {
  const bonus = rating === 2 ? w[15] : rating === 4 ? w[16] : 1.0;
  const sr =
    s *
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp(w[10] * (1 - r)) - 1) *
    bonus;
  return Math.max(sr, 0.1);
}

/** New stability after a lapse (rating = Again on a Review card) */
export function stabilityAfterLapse(
  d: number,
  s: number,
  r: number,
  w = DEFAULT_WEIGHTS,
): number {
  const sf =
    w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r));
  return Math.max(sf, 0.1);
}

/**
 * Next review interval in days for a card in Review state.
 * interval = S / FACTOR * (R_target^(1/DECAY) - 1)
 */
export function nextInterval(stability: number, desiredRetention = DESIRED_RETENTION): number {
  if (stability <= 0) return 1;
  const interval = (stability / FACTOR) * (Math.pow(desiredRetention, 1 / DECAY) - 1);
  return Math.max(1, Math.round(interval));
}

// ─── Scheduling ────────────────────────────────────────────────────────────────

export interface ScheduleInput {
  state: CardState;
  stability: number;
  difficulty: number;
  step: number;
  lapses: number;
  reps: number;
  lastReview: Date | null;
}

export interface ScheduleOutput {
  state: CardState;
  stability: number;
  difficulty: number;
  step: number;
  lapses: number;
  reps: number;
  due: Date;
  /** Preview: estimated next interval per rating (days) */
  preview?: { 1: number; 2: number; 3: number; 4: number };
}

/**
 * Compute the next card state after a review.
 *
 * @example
 * const next = schedule({ state: 0, stability: 0, difficulty: 0, step: 0, lapses: 0, reps: 0, lastReview: null }, 3, new Date());
 */
export function schedule(
  card: ScheduleInput,
  rating: Rating,
  reviewedAt: Date,
  w = DEFAULT_WEIGHTS,
): ScheduleOutput {
  const elapsedDays = card.lastReview
    ? Math.max(0, Math.floor((reviewedAt.getTime() - card.lastReview.getTime()) / 86_400_000))
    : 0;

  const r = retrievability(elapsedDays, card.stability);
  const updated: ScheduleOutput = {
    ...card,
    reps: card.reps + 1,
    due: reviewedAt,
  };

  switch (card.state) {
    case 0: return _scheduleNew(updated, rating, reviewedAt, w);
    case 1: return _scheduleLearning(updated, rating, reviewedAt, r, w, false);
    case 2: return _scheduleReview(updated, rating, reviewedAt, r, w);
    case 3: return _scheduleLearning(updated, rating, reviewedAt, r, w, true);
  }
}

/** Preview intervals for all 4 ratings without committing state */
export function previewIntervals(
  card: ScheduleInput,
  reviewedAt: Date,
  w = DEFAULT_WEIGHTS,
): { 1: number; 2: number; 3: number; 4: number } {
  const get = (r: Rating) => {
    const out = schedule(card, r, reviewedAt, w);
    const days = Math.round((out.due.getTime() - reviewedAt.getTime()) / 86_400_000);
    return Math.max(0, days);
  };
  return { 1: get(1), 2: get(2), 3: get(3), 4: get(4) };
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function clampDifficulty(d: number): number {
  return Math.min(10, Math.max(1, d));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function _scheduleNew(
  card: ScheduleOutput,
  rating: Rating,
  now: Date,
  w: readonly number[],
): ScheduleOutput {
  card.stability = initialStability(rating, w);
  card.difficulty = initialDifficulty(rating, w);

  if (rating === 1 || rating === 2) {
    // → Learning step 0
    card.state = 1;
    card.step = 0;
    card.due = addMinutes(now, LEARNING_STEPS[0]);
  } else if (rating === 3) {
    // Good → Learning step 1 (skip first)
    card.state = 1;
    card.step = 1;
    card.due = addMinutes(now, LEARNING_STEPS[1]);
  } else {
    // Easy → straight to Review
    card.state = 2;
    card.step = 0;
    card.due = addDays(now, nextInterval(card.stability));
  }
  return card;
}

function _scheduleLearning(
  card: ScheduleOutput,
  rating: Rating,
  now: Date,
  r: number,
  w: readonly number[],
  isRelearning: boolean,
): ScheduleOutput {
  const steps = isRelearning ? RELEARNING_STEPS : LEARNING_STEPS;

  if (rating === 1) {
    // Again → restart from step 0
    card.step = 0;
    card.due = addMinutes(now, steps[0]);
    if (isRelearning) card.lapses++;
  } else if (rating === 4 || card.step >= steps.length - 1) {
    // Easy or last step → graduate to Review
    card.state = 2;
    card.step = 0;
    const newS = isRelearning
      ? stabilityAfterLapse(card.difficulty, card.stability, r, w)
      : card.stability;
    card.stability = newS;
    card.difficulty = updateDifficulty(card.difficulty, rating, w);
    card.due = addDays(now, nextInterval(card.stability));
  } else {
    // Advance to next step
    card.step++;
    card.due = addMinutes(now, steps[card.step]);
  }
  return card;
}

function _scheduleReview(
  card: ScheduleOutput,
  rating: Rating,
  now: Date,
  r: number,
  w: readonly number[],
): ScheduleOutput {
  if (rating === 1) {
    // Lapse → Relearning
    card.lapses++;
    card.stability = stabilityAfterLapse(card.difficulty, card.stability, r, w);
    card.difficulty = updateDifficulty(card.difficulty, rating, w);
    card.state = 3;
    card.step = 0;
    card.due = addMinutes(now, RELEARNING_STEPS[0]);
  } else {
    // Successful recall
    card.stability = stabilityAfterRecall(card.difficulty, card.stability, r, rating, w);
    card.difficulty = updateDifficulty(card.difficulty, rating, w);
    card.due = addDays(now, nextInterval(card.stability));
  }
  return card;
}
