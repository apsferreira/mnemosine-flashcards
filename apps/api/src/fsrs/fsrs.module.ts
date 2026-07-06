import { Module } from '@nestjs/common';
import { FsrsService } from './fsrs.service';

/**
 * NestJS concept: Module — groups related providers and controllers.
 * FsrsModule exports FsrsService so other modules can import and use it.
 */
@Module({
  providers: [FsrsService],
  exports: [FsrsService],
})
export class FsrsModule {}
