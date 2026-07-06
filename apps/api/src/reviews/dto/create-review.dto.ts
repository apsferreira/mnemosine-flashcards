import { IsUUID, IsInt, Min, Max, IsPositive } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  cardId: string;

  /** Rating: 1=Again, 2=Hard, 3=Good, 4=Easy */
  @IsInt()
  @Min(1)
  @Max(4)
  rating: 1 | 2 | 3 | 4;

  /** Duration the user spent looking at the card, in milliseconds */
  @IsInt()
  @IsPositive()
  durationMs: number;
}
