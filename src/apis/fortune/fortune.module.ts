import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FortuneController } from './fortune.controller';
import { FortuneService } from './fortune.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [HttpModule, FirebaseModule],
  controllers: [FortuneController],
  providers: [FortuneService],
  exports: [FortuneService],
})
export class FortuneModule { } 