import { WorkModeEnum } from 'src/enums/work-mode.enum';
import { Company } from './company.type';
import { Location } from './location.type';

export type JobOffer = {
  id: number;
  providerId: string;
  providerJobId: string;
  position: string;
  workMode: WorkModeEnum;
  employmentType?: string | null;
  experienceRequired?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  datePosted?: Date | null;
  company: Company;
  location: Location;
  requirements: string[];
};
