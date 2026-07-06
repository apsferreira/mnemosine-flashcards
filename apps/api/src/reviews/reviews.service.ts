import { Injectable } from '@nestjs/common';
import { FsrsService } from '../fsrs/fsrs.service';
import type { CreateReviewDto } from './dto/create-review.dto';

/**
 * ReviewsService — coração do sistema SRS.
 *
 * TODO (aprenda): implemente create() seguindo estes passos:
 *
 * 1. Busca o card pelo cardId no banco
 * 2. Monta um ScheduleInput com os campos do card
 * 3. Chama this.fsrs.schedule(input, dto.rating)
 * 4. Atualiza o card no banco com o ScheduleOutput (state, stability, difficulty, due, step)
 * 5. Persiste o review (card_id, rating, duration_ms, state_before, state_after)
 * 6. Retorna o card atualizado
 *
 * Isso demonstra: transações de banco, DTOs de saída, error handling com NotFoundException.
 */
@Injectable()
export class ReviewsService {
  constructor(private readonly fsrs: FsrsService) {}

  async create(dto: CreateReviewDto) {
    // TODO: implemente os 6 passos acima
    throw new Error('Not implemented');
  }
}
