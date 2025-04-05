import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FortuneController } from './fortune.controller';
import { FortuneService } from './fortune.service';

@Module({
  imports: [HttpModule],
  controllers: [FortuneController],
  providers: [FortuneService],
  exports: [FortuneService],
})
export class FortuneModule { } 