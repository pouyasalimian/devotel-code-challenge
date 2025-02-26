import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { ApiController } from './api.controller';

@Module({
  imports: [DomainModule],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
