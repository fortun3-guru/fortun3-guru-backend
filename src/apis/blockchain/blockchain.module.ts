import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractEventListener } from './contract-event-listener';
import { MintingEventListener } from './minting-event-listener';
import { FirebaseModule } from '../../firebase/firebase.module';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [ConfigModule, FirebaseModule],
  controllers: [BlockchainController],
  providers: [ContractEventListener, MintingEventListener],
  exports: [ContractEventListener, MintingEventListener],
})
export class BlockchainModule { } 