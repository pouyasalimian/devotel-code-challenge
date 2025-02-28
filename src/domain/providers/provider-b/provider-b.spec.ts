import { ProviderB } from './provider-b';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}));

describe('ProviderB', () => {
  let providerB: ProviderB;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(() => {
    httpService = new HttpService();
    configService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'PROVIDER_BASE_URL') return 'http://mock-api.com';
        return null;
      }),
    } as any;

    providerB = new ProviderB(httpService, configService);
  });

  it('should fetch and map job offers correctly', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        status: 'success',
        data: {
          jobsList: {
            'job-555': {
              position: 'Data Scientist',
              location: { city: 'Austin', state: 'CA', remote: false },
              compensation: { min: 60000, max: 93000, currency: 'USD' },
              employer: {
                companyName: 'DataWorks',
                website: 'https://dataworks.com',
              },
              requirements: {
                experience: 5,
                technologies: ['JavaScript', 'Node.js', 'React'],
              },
              datePosted: '2025-02-17',
            },
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    };

    jest.spyOn(httpService.axiosRef, 'get').mockResolvedValueOnce(mockResponse);
    const result = await providerB.fetch();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        providerId: 'PROVIDER_2',
        providerJobId: 'job-555',
        position: 'Data Scientist',
        workMode: 'ONSITE',
        experienceRequired: 5,
        minSalary: 60000,
        maxSalary: 93000,
        currency: 'USD',
      }),
    );
  });

  it('should return an empty array when fetch fails', async () => {
    jest
      .spyOn(httpService.axiosRef, 'get')
      .mockRejectedValueOnce(new Error('Network Error'));
    const result = await providerB.fetch();
    expect(result).toEqual([]);
  });

  it('should correctly map API response to job offers', () => {
    const response = {
      status: 'success',
      data: {
        jobsList: {
          'job-123': {
            position: 'Software Engineer',
            location: { city: 'San Francisco', state: 'CA', remote: true },
            compensation: { min: 70000, max: 120000, currency: 'USD' },
            employer: {
              companyName: 'Tech Inc',
              website: 'https://techinc.com',
            },
            requirements: {
              experience: 2,
              technologies: ['TypeScript', 'NestJS'],
            },
            datePosted: '2025-02-10',
          },
        },
      },
    };

    const mappedJobs = Reflect.get(providerB, 'mapApiResponseToJobOffers').call(
      providerB,
      response,
    );
    expect(mappedJobs).toHaveLength(1);
    expect(mappedJobs[0]).toEqual(
      expect.objectContaining({
        providerId: 'PROVIDER_2',
        providerJobId: 'job-123',
        position: 'Software Engineer',
        workMode: 'REMOTE',
        experienceRequired: 2,
        minSalary: 70000,
        maxSalary: 120000,
        currency: 'USD',
      }),
    );
  });
});
