import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from 'src/database';
import { ProviderA } from 'src/domain/providers/provider-a/provider-a';
import { ProviderB } from 'src/domain/providers/provider-b/provider-b';
import { IProvider } from 'src/interfaces/provider.interface';
import { JobOffer } from 'src/types/job-offer.type';

@Injectable()
export class FetchService {
  private readonly activeProviders: IProvider[];
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.activeProviders = [
      new ProviderA(this.httpService, this.configService),
      new ProviderB(this.httpService, this.configService),
    ];
  }

  async fetch(): Promise<JobOffer[]> {
    const jobs = [];
    for (const provider of this.activeProviders) {
      jobs.push(...(await provider.fetch()));
    }
    return jobs;
  }

  async store(jobOffers: JobOffer[]) {
    const companiesMap = new Map<string, number>();
    const locationsMap = new Map<string, number>();

    // Fetch existing companies and locations
    const existingCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    existingCompanies.forEach((c) => companiesMap.set(c.name, c.id));

    const existingLocations = await prisma.location.findMany({
      select: { id: true, city: true, state: true },
    });
    existingLocations.forEach((l) =>
      locationsMap.set(`${l.city}-${l.state}`, l.id),
    );

    // Prepare unique companies and locations for bulk insert
    const newCompanies = jobOffers
      .filter((j) => !companiesMap.has(j.company.name))
      .map((j) => ({
        name: j.company.name,
        website: j.company.website,
        industry: j.company.industry,
      }));

    const newLocations = jobOffers
      .filter(
        (j) => !locationsMap.has(`${j.location.city}-${j.location.state}`),
      )
      .map((j) => ({ city: j.location.city, state: j.location.state }));

    // Insert new companies and locations
    if (newCompanies.length) {
      const createdCompanies = await prisma.company.createMany({
        data: newCompanies,
        skipDuplicates: true,
      });
      if (createdCompanies) {
        const fetchedCompanies = await prisma.company.findMany({
          select: { id: true, name: true },
        });
        fetchedCompanies.forEach((c) => companiesMap.set(c.name, c.id));
      }
    }

    if (newLocations.length) {
      const createdLocations = await prisma.location.createMany({
        data: newLocations,
        skipDuplicates: true,
      });
      if (createdLocations) {
        const fetchedLocations = await prisma.location.findMany({
          select: { id: true, city: true, state: true },
        });
        fetchedLocations.forEach((l) =>
          locationsMap.set(`${l.city}-${l.state}`, l.id),
        );
      }
    }

    // Prepare job offers for bulk insert
    const jobOfferRecords = jobOffers.map((j) => ({
      providerId: j.providerId,
      providerJobId: j.providerJobId,
      position: j.position,
      workMode: j.workMode,
      employmentType: j.employmentType,
      experienceRequired: j.experienceRequired,
      minSalary: j.minSalary,
      maxSalary: j.maxSalary,
      currency: j.currency,
      datePosted: j.datePosted,
      companyId: companiesMap.get(j.company.name)!,
      locationId: locationsMap.get(`${j.location.city}-${j.location.state}`)!,
      requirements: j.requirements,
    }));

    // Bulk insert job offers
    await prisma.jobOffer.createMany({
      data: jobOfferRecords,
      skipDuplicates: true,
    });
  }

  async fetchAndStore() {
    const jobs = await this.fetch();
    await this.store(jobs);
    return jobs;
  }
}
