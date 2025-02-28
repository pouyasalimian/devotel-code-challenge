import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchService } from 'src/domain/services/fetch/fetch.service';
import cron from 'cron-validate';

@Injectable()
export class FetchJobOfferService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FetchJobOfferService.name);

  constructor(
    private fetchService: FetchService,
    private configService: ConfigService,
  ) {
    const cronExp = this.configService.get('FETCH_JOB_OFFER_CRON');
    const isValidMinuteCron = !cron(cronExp).isValid();
    const isValidSecondCron = !cron(cronExp, {
      preset: 'default',
      override: {
        useSeconds: true,
      },
    }).isValid();
    if (cronExp && !isValidMinuteCron && !isValidSecondCron) {
      throw new Error(
        `Invalid cron expression: ${cronExp}, Please set valid cron expression in FETCH_JOB_OFFER_CRON env`,
      );
    }
  }

  async onApplicationBootstrap() {
    this.logger.log(
      '🏁 Start fetching and storing job offer at project startup',
    );
    await this.fetchService.fetchAndStore();
    this.logger.log('✅ Fetching and storing job offer is done');
  }

  @Cron(process.env.FETCH_JOB_OFFER_CRON || CronExpression.EVERY_MINUTE)
  async fetch() {
    this.logger.log('🏁 Start fetching and storing job offer');
    await this.fetchService.fetchAndStore();
    this.logger.log('✅ Fetching and storing job offer is done');
  }
}
