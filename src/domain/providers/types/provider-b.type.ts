export type ProviderBGetJobsOkResponse = {
  status: string;
  data: {
    jobsList: Record<
      string,
      {
        position: string;
        location: {
          city: string;
          state: string;
          remote: boolean;
        };
        compensation: {
          min: number;
          max: number;
          currency: string;
        };
        employer: {
          companyName: string;
          website: string;
        };
        requirements: {
          experience: number;
          technologies: string[];
        };
        datePosted: string;
      }
    >;
  };
};
