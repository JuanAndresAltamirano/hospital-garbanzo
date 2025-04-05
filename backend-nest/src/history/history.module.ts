import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { Timeline } from './entities/timeline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timeline])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
