import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { SwaggerConfig } from './configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);

  app.useGlobalPipes();

  if (configService.get<string>('APP_ENV', 'production') === 'development') {
    app.enableCors();
  }

  SwaggerConfig.configure(app);

  await app.listen(
    configService.get<number>('APP_PORT', 3000),
    configService.get<string>('APP_HOST', '127.0.0.1'),
  );
}

bootstrap();
