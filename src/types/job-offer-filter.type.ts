import { WorkModeEnum } from 'src/enums/work-mode.enum';

export type JobOfferFilterOptions = {
  search?: string;
  workMode?: WorkModeEnum;
  minSalary?: number;
  maxSalary?: number;
  companyName?: string;
  state?: string;
  city?: string;
  requirements?: string[];
  page: number;
  pageSize: number;
};
