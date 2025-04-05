import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './apis/auth/auth.module';
import { UserModule } from './apis/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { FirebaseModule } from './firebase/firebase.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';
import { NFTModule } from './apis/nft/nft.module';
import { WorldcoinModule } from './apis/worldcoin/worldcoin.module';
import { BlockchainModule } from './apis/blockchain/blockchain.module';
import { FortuneModule } from './apis/fortune/fortune.module';
import configs from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      load: configs,
    }),
    FirebaseModule,
    BlockchainModule,
    FortuneModule,
    AuthModule,
    UserModule,
    NFTModule,
    WorldcoinModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule { }
