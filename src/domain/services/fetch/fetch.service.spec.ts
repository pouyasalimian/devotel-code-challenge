import { Test, TestingModule } from '@nestjs/testing';
import { FetchService } from './fetch.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { prisma } from 'src/database';
import { ProviderA } from 'src/domain/providers/provider-a/provider-a';
import { ProviderB } from 'src/domain/providers/provider-b/provider-b';
import { JobOffer } from 'src/types/job-offer.type';
import { WorkModeEnum } from 'src/enums/work-mode.enum';

jest.mock('src/database', () => ({
  prisma: {
    company: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    location: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    jobOffer: {
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  },
}));

describe('FetchService', () => {
  let fetchService: FetchService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockJobOffers: JobOffer[] = [
    {
      providerId: 'PROVIDER_A',
      providerJobId: 'JOB_123',
      position: 'Backend Engineer',
      workMode: WorkModeEnum.ONSITE,
      employmentType: 'Full-Time',
      experienceRequired: null,
      minSalary: 84000,
      maxSalary: 147000,
      currency: 'USD',
      company: {
        name: 'BackEnd Solutions',
        industry: 'Solutions',
        website: null,
      },
      location: { city: 'San Francisco', state: 'CA' },
      requirements: ['JavaScript', 'Node.js', 'React'],
    },
    {
      providerId: 'PROVIDER_B',
      providerJobId: 'JOB_456',
      position: 'Backend Engineer',
      workMode: WorkModeEnum.ONSITE,
      employmentType: 'Full-Time',
      experienceRequired: null,
      minSalary: 95000,
      maxSalary: 148000,
      currency: 'USD',
      company: {
        name: 'Creative Design Ltd',
        industry: 'Analytics',
        website: null,
      },
      location: { city: 'San Francisco', state: 'CA' },
      requirements: ['Java', 'Spring Boot', 'AWS'],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of({ data: {} })), // Mock Axios response
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'), // Mock ConfigService
          },
        },
      ],
    }).compile();

    fetchService = module.get<FetchService>(FetchService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should fetch job offers from providers', async () => {
    const providerA = new ProviderA(httpService, configService);
    const providerB = new ProviderB(httpService, configService);

    jest.spyOn(providerA, 'fetch').mockResolvedValue([mockJobOffers[0]]);
    jest.spyOn(providerB, 'fetch').mockResolvedValue([mockJobOffers[1]]);

    fetchService['activeProviders'] = [providerA, providerB];

    const jobs = await fetchService.fetch();
    expect(jobs).toHaveLength(2);
    expect(jobs).toEqual(mockJobOffers);
  });

  it('should store job offers correctly', async () => {
    await fetchService.store(mockJobOffers);

    expect(prisma.company.findMany).toHaveBeenCalled();
    expect(prisma.location.findMany).toHaveBeenCalled();
    expect(prisma.company.createMany).toHaveBeenCalled();
    expect(prisma.location.createMany).toHaveBeenCalled();
    expect(prisma.jobOffer.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          providerId: 'PROVIDER_A',
          providerJobId: 'JOB_123',
        }),
        expect.objectContaining({
          providerId: 'PROVIDER_B',
          providerJobId: 'JOB_456',
        }),
      ]),
      skipDuplicates: true,
    });
  });

  it('should fetch and store job offers correctly', async () => {
    jest.spyOn(fetchService, 'fetch').mockResolvedValue(mockJobOffers);
    jest.spyOn(fetchService, 'store').mockResolvedValue();

    const result = await fetchService.fetchAndStore();

    expect(fetchService.fetch).toHaveBeenCalled();
    expect(fetchService.store).toHaveBeenCalledWith(mockJobOffers);
    expect(result).toEqual(mockJobOffers);
  });
});
