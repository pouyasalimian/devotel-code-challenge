import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProviderA } from './provider-a';
import { WorkModeEnum } from '../../../enums/work-mode.enum';
import { ProviderAGetJobsOkResponse } from '../types/provider-a.type';

describe('ProviderA', () => {
  let providerA: ProviderA;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'PROVIDER_BASE_URL') return 'https://mock-api.com';
      return null;
    }),
  };

  const mockResponse: ProviderAGetJobsOkResponse = {
    metadata: { requestId: 'req-suv506mg9', timestamp: new Date() },
    jobs: [
      {
        jobId: 'P1-283',
        title: 'Data Scientist',
        details: {
          location: 'New York, NY',
          type: 'Contract',
          salaryRange: '$90k - $104k',
        },
        company: { name: 'BackEnd Solutions', industry: 'Analytics' },
        skills: ['HTML', 'CSS', 'Vue.js'],
        postedDate: new Date('2025-02-22T18:43:52.591Z'),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderA,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    providerA = module.get<ProviderA>(ProviderA);
    httpService = module.get<HttpService>(HttpService);

    // Mock private properties
    Reflect.set(providerA, 'httpService', httpService);
  });

  it('should be defined', () => {
    expect(providerA).toBeDefined();
  });

  it('should fetch and map job offers correctly', async () => {
    jest
      .spyOn(httpService.axiosRef, 'get')
      .mockResolvedValueOnce({ data: mockResponse });

    const result = await providerA.fetch();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      providerId: 'PROVIDER_1',
      providerJobId: 'P1-283',
      position: 'Data Scientist',
      workMode: WorkModeEnum.ONSITE,
      employmentType: 'Contract',
      datePosted: new Date('2025-02-22T18:43:52.591Z'),
      company: { name: 'BackEnd Solutions', industry: 'Analytics' },
      location: { city: 'New York', state: 'NY' },
      requirements: ['HTML', 'CSS', 'Vue.js'],
      minSalary: 90000,
      maxSalary: 104000,
      currency: 'USD',
    });
  });

  it('should return an empty array when fetch fails', async () => {
    jest
      .spyOn(httpService.axiosRef, 'get')
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await providerA.fetch();

    expect(result).toEqual([]);
  });

  it('should correctly map location', () => {
    const result = Reflect.get(providerA, 'mapLocation').call(
      providerA,
      'San Francisco, CA',
    );
    expect(result).toEqual({ city: 'San Francisco', state: 'CA' });
  });

  it('should correctly map company data', () => {
    const companyData = { name: 'TechCorp', industry: 'Software' };
    const result = Reflect.get(providerA, 'mapCompany').call(
      providerA,
      companyData,
    );
    expect(result).toEqual(companyData);
  });

  it('should correctly parse salary range', () => {
    const job = { details: { salaryRange: '$120k - $150k' }, jobId: 'P1-123' };
    const result = Reflect.get(providerA, 'parseSalary').call(providerA, job);
    expect(result).toEqual({
      minSalary: 120000,
      maxSalary: 150000,
      currency: 'USD',
    });
  });

  it('should return empty object for invalid salary range', () => {
    const job = { details: { salaryRange: 'unknown' }, jobId: 'P1-123' };
    const result = Reflect.get(providerA, 'parseSalary').call(providerA, job);
    expect(result).toEqual({});
  });

  it('should correctly map a job offer', () => {
    const job = mockResponse.jobs[0];
    const result = Reflect.get(providerA, 'mapJobOffer').call(providerA, job);
    expect(result).toEqual({
      providerId: 'PROVIDER_1',
      providerJobId: 'P1-283',
      position: 'Data Scientist',
      workMode: WorkModeEnum.ONSITE,
      employmentType: 'Contract',
      datePosted: new Date('2025-02-22T18:43:52.591Z'),
      company: { name: 'BackEnd Solutions', industry: 'Analytics' },
      location: { city: 'New York', state: 'NY' },
      requirements: ['HTML', 'CSS', 'Vue.js'],
      minSalary: 90000,
      maxSalary: 104000,
      currency: 'USD',
    });
  });
});
