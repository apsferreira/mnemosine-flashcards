import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * NestJS concept: Controller
 *
 * Controllers handle HTTP requests and delegate to services.
 * - @Controller('decks') → prefixes all routes with /decks
 * - @UseGuards(JwtAuthGuard) → protects all routes in this controller
 * - @ParseUUIDPipe → validates that :id is a valid UUID (pipe)
 *
 * TODO (aprenda): adicione paginação no GET /decks usando um QueryDto
 * com @IsOptional() page e limit, e aplique um @Query() decorator.
 */
@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  /** POST /decks — cria um novo deck */
  @Post()
  create(@Body() dto: CreateDeckDto) {
    return this.decksService.create(dto);
  }

  /** GET /decks — lista todos os decks com due_cards e total_cards */
  @Get()
  findAll() {
    return this.decksService.findAll();
  }

  /** GET /decks/:id/next — próximo card a revisar (algoritmo FSRS) */
  @Get(':id/next')
  getNextCard(@Param('id', ParseUUIDPipe) id: string) {
    return this.decksService.getNextCard(id);
  }

  /** GET /decks/:id/preview — intervalos estimados por rating */
  @Get(':id/preview')
  previewIntervals(@Param('id', ParseUUIDPipe) id: string) {
    return this.decksService.previewIntervals(id);
  }

  /**
   * POST /decks/:id/import — importa cards via CSV
   *
   * TODO (aprenda): implemente este endpoint usando o Multer (FileInterceptor)
   * para receber o arquivo e o CsvService para parsear.
   * Formato esperado: front,back (uma linha por card)
   */
  @Post(':id/import')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.decksService.importCsv(id, file);
  }
}
