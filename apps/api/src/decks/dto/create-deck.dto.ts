import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

/**
 * NestJS concept: DTO (Data Transfer Object) + class-validator
 *
 * DTOs define the shape of incoming request bodies.
 * class-validator decorators run inside the ValidationPipe (global pipe).
 *
 * TODO (aprenda): adicione um campo `fsrsParams` opcional (JSONB) que
 * permite personalizar os pesos do FSRS por deck.
 */
export class CreateDeckDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
