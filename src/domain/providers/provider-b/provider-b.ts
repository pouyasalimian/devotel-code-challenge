import { JobOffer } from 'src/types/job-offer.type';
import { ProviderBGetJobsOkResponse } from '../types/provider-b.type';
import { Company } from 'src/types/company.type';
import { Location } from 'src/types/location.type';
import { WorkModeEnum } from 'src/enums/work-mode.enum';
import { IProvider } from 'src/interfaces/provider.interface';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export class ProviderB implements IProvider {
  private readonly logger = new Logger(ProviderB.name);
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PROVIDER_BASE_URL');
  }

  async fetch(): Promise<JobOffer[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<ProviderBGetJobsOkResponse>(
          `${this.baseUrl}/api/provider2/jobs`,
        );

      const data = this.mapApiResponseToJobOffers(response.data);

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Failed to fetch data from provider A', {
          statusCode: error.code,
          response: error.response,
        });
      } else {
        this.logger.error(
          'Unexpected error occurred in fetching and mapping data from provider A',
          error,
        );
      }
      return [];
    }
  }
  private mapApiResponseToJobOffers(
    response: ProviderBGetJobsOkResponse,
  ): JobOffer[] {
    return Object.entries(response.data.jobsList).map(
      ([providerJobId, jobData]) => {
        const workMode = jobData.location.remote
          ? WorkModeEnum.REMOTE
          : WorkModeEnum.ONSITE;

        const company: Company = {
          name: jobData.employer.companyName,
          website: jobData.employer.website,
          industry: null,
        };

        const location: Location = {
          city: jobData.location.city,
          state: jobData.location.state,
        };

        return {
          providerId: 'PROVIDER_2',
          providerJobId,
          position: jobData.position,
          workMode,
          employmentType: null,
          experienceRequired: jobData.requirements.experience,
          minSalary: jobData.compensation.min,
          maxSalary: jobData.compensation.max,
          currency: jobData.compensation.currency,
          datePosted: new Date(jobData.datePosted),
          company,
          location,
          requirements: jobData.requirements.technologies,
        };
      },
    );
  }
}
