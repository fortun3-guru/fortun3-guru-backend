import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { setupSwagger } from './utils/swagger';
import * as functions from 'firebase-functions/v1';

async function createNestServer(expressInstance: express.Express) {
  const nestConfig = {
    nestEnabled: process.env.NEST_ENABLED === 'true',
    nestPort: process.env.NEST_PORT || 3000,
  };

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  setupSwagger(app);

  if (nestConfig.nestEnabled) {
    app.listen(nestConfig.nestPort);
  }

  await app.init();
}

const apiServer = express();
createNestServer(apiServer);

export const api = functions
  .region('asia-southeast1')
  .runWith({ memory: '1GB', timeoutSeconds: 120 })
  .https.onRequest(apiServer);
