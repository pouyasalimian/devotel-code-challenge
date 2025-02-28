import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FetchService } from './services/fetch/fetch.service';
import { JobOfferService } from './services/job-offer/job-offer.service';

@Module({
  imports: [HttpModule],
  providers: [FetchService, JobOfferService],
  exports: [FetchService, JobOfferService],
})
export class DomainModule {}
