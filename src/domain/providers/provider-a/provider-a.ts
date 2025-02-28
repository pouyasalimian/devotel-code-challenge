import { HttpService } from '@nestjs/axios';
import { IProvider } from 'src/interfaces/provider.interface';
import { Company } from 'src/types/company.type';
import { JobOffer } from 'src/types/job-offer.type';
import { Location } from 'src/types/location.type';
import { ProviderAGetJobsOkResponse } from '../types/provider-a.type';
import { WorkModeEnum } from '../../../enums/work-mode.enum';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export class ProviderA implements IProvider {
  private readonly logger = new Logger(ProviderA.name);
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService?.get<string>('PROVIDER_BASE_URL') || '';
  }

  async fetch(): Promise<JobOffer[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<ProviderAGetJobsOkResponse>(
          `${this.baseUrl}/api/provider1/jobs`,
        );

      const data = response.data.jobs.map((job) => this.mapJobOffer(job));

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

  private mapLocation(locationStr: string): Location {
    const [city, state] = locationStr.split(',').map((s) => s.trim());
    return {
      city,
      state,
    };
  }

  private mapCompany(companyData: { name: string; industry: string }): Company {
    return {
      name: companyData.name,
      industry: companyData.industry,
    };
  }

  private parseSalary(job: ProviderAGetJobsOkResponse['jobs'][0]): {
    minSalary?: number;
    maxSalary?: number;
    currency?: string;
  } {
    const salaryRange = job.details.salaryRange;
    const match = salaryRange.match(/\$(\d+)k - \$(\d+)k/);
    if (match) {
      return {
        minSalary: parseInt(match[1], 10) * 1000,
        maxSalary: parseInt(match[2], 10) * 1000,
        currency: 'USD',
      };
    } else {
      this.logger.error('Unsupported salary range in provider A', {
        salaryRange,
        jobId: job.jobId,
      });
    }
    return {};
  }

  private mapJobOffer(job: ProviderAGetJobsOkResponse['jobs'][0]): JobOffer {
    return {
      providerId: 'PROVIDER_1',
      providerJobId: job.jobId,
      position: job.title,
      workMode: WorkModeEnum.ONSITE, // provider does not send work mode so, default is onsite
      employmentType: job.details.type,
      datePosted: new Date(job.postedDate),
      company: this.mapCompany(job.company),
      location: this.mapLocation(job.details.location),
      requirements: job.skills,
      ...this.parseSalary(job),
    };
  }
}
