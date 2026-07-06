import { Injectable, NotFoundException } from '@nestjs/common';
import { FsrsService } from '../fsrs/fsrs.service';
import type { CreateDeckDto } from './dto/create-deck.dto';

/**
 * NestJS concept: Service
 *
 * Services contain business logic and are injected into controllers.
 * They can depend on other services (FsrsService here via constructor DI).
 *
 * TODO (aprenda): conecte ao PostgreSQL usando TypeORM ou Prisma.
 * Os métodos abaixo têm a assinatura correta — implemente o acesso ao banco.
 *
 * Sequência de aprendizado sugerida:
 * 1. Instale TypeORM: npm i @nestjs/typeorm typeorm pg
 * 2. Configure TypeOrmModule.forRoot() no AppModule
 * 3. Crie a entidade Deck com @Entity(), @PrimaryGeneratedColumn('uuid'), etc.
 * 4. Injete o Repository<Deck> aqui com @InjectRepository(Deck)
 */
@Injectable()
export class DecksService {
  constructor(private readonly fsrs: FsrsService) {}

  async create(dto: CreateDeckDto) {
    // TODO: INSERT INTO decks (name, description) VALUES (...)
    throw new Error('Not implemented — conecte ao banco de dados');
  }

  async findAll() {
    // TODO: SELECT decks.*, COUNT(cards WHERE due <= NOW()) as due_cards ...
    throw new Error('Not implemented');
  }

  async getNextCard(deckId: string) {
    // TODO: SELECT * FROM cards WHERE deck_id = ? AND due <= NOW() ORDER BY due LIMIT 1
    throw new Error('Not implemented');
  }

  async previewIntervals(deckId: string) {
    // TODO: busca o próximo card e calcula previewIntervals via FsrsService
    throw new Error('Not implemented');
  }

  async importCsv(deckId: string, file: Express.Multer.File) {
    // TODO: parse CSV → cria Note + Card para cada linha
    // Dica: use 'csv-parse' (npm i csv-parse)
    throw new Error('Not implemented');
  }
}
