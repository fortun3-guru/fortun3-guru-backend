import { Module } from '@nestjs/common';
import { WorldcoinService } from './worldcoin.service';
import { WorldcoinController } from './worldcoin.controller';

@Module({
  controllers: [WorldcoinController],
  providers: [WorldcoinService],
})
export class WorldcoinModule {}
