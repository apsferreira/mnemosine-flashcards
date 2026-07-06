import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * POST /reviews — submete uma revisão e agenda o próximo intervalo via FSRS-6.
 *
 * Este é o endpoint mais importante do sistema.
 * O fluxo é: rating do usuário → FsrsService.schedule() → salva novo estado no banco.
 */
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }
}
