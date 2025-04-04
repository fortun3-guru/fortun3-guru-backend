import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractEventListener } from './contract-event-listener';
import { FirebaseModule } from '../../firebase/firebase.module';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [ConfigModule, FirebaseModule],
  controllers: [BlockchainController],
  providers: [ContractEventListener],
  exports: [ContractEventListener],
})
export class BlockchainModule { } 