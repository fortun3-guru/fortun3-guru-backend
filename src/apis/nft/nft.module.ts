import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { ConfigModule } from '@nestjs/config';
import { IPFSService } from './ipfs.service';
import { NordicApiService } from './nordic-api.service';
import { NordicApiController } from './nordic-api.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NFTController, NordicApiController],
  providers: [NFTService, IPFSService, NordicApiService],
  exports: [NFTService, IPFSService, NordicApiService],
})
export class NFTModule { }
