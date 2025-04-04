import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { ConfigModule } from '@nestjs/config';
import { IPFSService } from './ipfs.service';

@Module({
  imports: [ConfigModule],
  controllers: [NFTController],
  providers: [NFTService, IPFSService],
  exports: [NFTService, IPFSService],
})
export class NFTModule {}
