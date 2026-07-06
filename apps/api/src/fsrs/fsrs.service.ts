import { Injectable } from '@nestjs/common';
import {
  schedule,
  previewIntervals,
  DEFAULT_WEIGHTS,
  type ScheduleInput,
  type ScheduleOutput,
} from '@mnemosine/core';
import type { Rating } from '@mnemosine/core';

/**
 * FsrsService wraps the pure FSRS-6 algorithm from @mnemosine/core.
 *
 * NestJS concept: Injectable service — can be injected into any module
 * via dependency injection (DI). No constructor arguments needed here
 * because it wraps pure functions.
 */
@Injectable()
export class FsrsService {
  schedule(card: ScheduleInput, rating: Rating, reviewedAt = new Date()): ScheduleOutput {
    return schedule(card, rating, reviewedAt, DEFAULT_WEIGHTS);
  }

  preview(card: ScheduleInput, reviewedAt = new Date()) {
    return previewIntervals(card, reviewedAt, DEFAULT_WEIGHTS);
  }
}
