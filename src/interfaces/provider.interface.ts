import { JobOffer } from 'src/types/job-offer.type';

export interface IProvider {
  fetch(): Promise<JobOffer[]>;
}
