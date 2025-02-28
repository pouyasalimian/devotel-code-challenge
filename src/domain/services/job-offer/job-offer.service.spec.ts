import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';
import { NotFoundException } from '@nestjs/common';
import { prisma } from 'src/database';
import { JobOfferDto } from 'src/dto/job-offer.dto';
import { JobOfferFilterOptions } from 'src/types/job-offer-filter.type';
import { WorkModeEnum } from 'src/enums/work-mode.enum';

jest.mock('src/database', () => ({
  prisma: {
    jobOffer: {
      count: jest.fn() as jest.MockedFunction<typeof prisma.jobOffer.count>,
      findMany: jest.fn() as jest.MockedFunction<
        typeof prisma.jobOffer.findMany
      >,
    },
  },
}));

describe('JobOfferService', () => {
  let jobOfferService: JobOfferService;

  const mockJobOffers: JobOfferDto[] = [
    {
      id: 1,
      position: 'Backend Engineer',
      workMode: 'ONSITE',
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
      id: 2,
      position: 'Backend Engineer',
      workMode: 'ONSITE',
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
      providers: [JobOfferService],
    }).compile();

    jobOfferService = module.get<JobOfferService>(JobOfferService);
  });

  it('should return job offers with pagination info', async () => {
    const filterOptions: JobOfferFilterOptions = {
      search: 'Backend',
      page: 1,
      pageSize: 10,
      workMode: WorkModeEnum.ONSITE,
    };

    (prisma.jobOffer.count as jest.Mock).mockResolvedValue(2);
    (prisma.jobOffer.findMany as jest.Mock).mockResolvedValue(mockJobOffers);

    const result = await jobOfferService.getJobOffers(filterOptions);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockJobOffers);
    expect(result.pageInfo).toEqual({ hasNextPage: false, total: 2 });

    expect(prisma.jobOffer.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) }),
    );
    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) }),
    );
  });

  it('should return hasNextPage as true if more results exist', async () => {
    const filterOptions: JobOfferFilterOptions = {
      search: 'Backend',
      page: 1,
      pageSize: 1,
      workMode: WorkModeEnum.ONSITE,
    };

    (prisma.jobOffer.count as jest.Mock).mockResolvedValue(2);
    (prisma.jobOffer.findMany as jest.Mock).mockResolvedValue([
      mockJobOffers[0],
    ]);

    const result = await jobOfferService.getJobOffers(filterOptions);

    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('should throw NotFoundException if no job offers match filters', async () => {
    const filterOptions: JobOfferFilterOptions = {
      search: 'Nonexistent Job',
      page: 1,
      pageSize: 10,
    };

    (prisma.jobOffer.count as jest.Mock).mockResolvedValue(0);
    (prisma.jobOffer.findMany as jest.Mock).mockResolvedValue([]);

    await expect(jobOfferService.getJobOffers(filterOptions)).rejects.toThrow(
      new NotFoundException({
        success: false,
        message: "There isn't any job offer with your selected filter",
      }),
    );
  });
});
