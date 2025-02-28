import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DomainModule } from '../domain/domain.module';
import { FetchJobOfferService } from './crons/fetch-job-offers.cron';

@Module({
  imports: [ScheduleModule.forRoot(), DomainModule],
  providers: [FetchJobOfferService],
  exports: [FetchJobOfferService],
})
export class TasksModule {}
