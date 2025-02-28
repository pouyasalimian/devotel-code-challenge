import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { prisma } from 'src/database';
import { JobOfferDto } from 'src/dto/job-offer.dto';
import { JobOfferFilterOptions } from 'src/types/job-offer-filter.type';

@Injectable()
export class JobOfferService {
  async getJobOffers(options: JobOfferFilterOptions): Promise<{
    success: boolean;
    data: JobOfferDto[];
    pageInfo: { hasNextPage: boolean; total: number };
  }> {
    const filters: Prisma.JobOfferWhereInput = {};
    if (options.search) {
      filters.position = { contains: options.search, mode: 'insensitive' };
    }
    if (options.workMode) {
      filters.workMode = options.workMode;
    }
    if (options.minSalary) {
      filters.minSalary = { gte: options.minSalary };
    }
    if (options.maxSalary) {
      filters.maxSalary = { lte: options.maxSalary };
    }
    if (options.companyName) {
      filters.company = {
        name: { contains: options.companyName, mode: 'insensitive' },
      };
    }
    if (options.state || options.city) {
      filters.location = {};
      if (options.state)
        filters.location.state = {
          contains: options.state,
          mode: 'insensitive',
        };
      if (options.city)
        filters.location.city = { contains: options.city, mode: 'insensitive' };
    }
    if (options.requirements && options.requirements.length) {
      filters.requirements = { hasSome: options.requirements };
    }

    const take = Math.min(options.pageSize, 50);
    const skip = (options.page - 1) * take;
    const total = await prisma.jobOffer.count({ where: filters });
    const hasNextPage = skip + take < total;

    const data = await prisma.jobOffer.findMany({
      where: filters,
      select: {
        id: true,
        position: true,
        workMode: true,
        employmentType: true,
        experienceRequired: true,
        minSalary: true,
        maxSalary: true,
        currency: true,
        company: { select: { name: true, industry: true, website: true } },
        location: { select: { city: true, state: true } },
        requirements: true,
      },
      skip,
      take,
    });

    if (!data.length) {
      throw new NotFoundException({
        success: false,
        message: "There isn't any job offer with your selected filter",
      });
    }

    return { success: true, data, pageInfo: { hasNextPage, total } };
  }
}
