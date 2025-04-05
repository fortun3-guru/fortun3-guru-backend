import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { ConfigModule } from '@nestjs/config';
import { IPFSService } from './ipfs.service';
import { NordicApiService } from './nordic-api.service';
import { NordicApiController } from './nordic-api.controller';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [ConfigModule, FirebaseModule, BlockchainModule],
  controllers: [NFTController, NordicApiController, WebhookController],
  providers: [NFTService, IPFSService, NordicApiService, WebhookService],
  exports: [NFTService, IPFSService, NordicApiService, WebhookService],
})
export class NFTModule { }
