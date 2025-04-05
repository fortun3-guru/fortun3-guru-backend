import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FortuneController } from './fortune.controller';
import { FortuneService } from './fortune.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NFTModule } from 'src/apis/nft/nft.module';

@Module({
  imports: [HttpModule, FirebaseModule, NFTModule],
  controllers: [FortuneController],
  providers: [FortuneService],
  exports: [FortuneService],
})
export class FortuneModule { } 