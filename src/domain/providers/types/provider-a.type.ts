export type ProviderAGetJobsOkResponse = {
  metadata: Metadata;
  jobs: ProviderAJob[];
};

type ProviderAJob = {
  jobId: string;
  title: string;
  details: Details;
  company: Company;
  skills: string[];
  postedDate: Date;
};

type Company = {
  name: string;
  industry: string;
};

type Details = {
  location: string;
  type: string;
  salaryRange: string;
};

type Metadata = {
  requestId: string;
  timestamp: Date;
};
