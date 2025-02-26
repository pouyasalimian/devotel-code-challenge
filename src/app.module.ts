import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const transport =
          configService.get<string>('APP_ENV') === 'development'
            ? { target: 'pino-pretty' }
            : {
                target: 'pino-syslog',
                options: {
                  enablePipelining: false,
                  destination: 1, // 1 = stdout, 2 = stderr
                  modern: true,
                },
              };

        return {
          pinoHttp: {
            autoLogging: false,
            transport: transport,
          },
        };
      },
      inject: [ConfigService],
    }),
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
