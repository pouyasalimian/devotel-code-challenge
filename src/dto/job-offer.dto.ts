import { ApiProperty } from '@nestjs/swagger';
import { WorkModeEnum } from '@prisma/client';

class CompanyDto {
  @ApiProperty({ description: 'Name of company' })
  name: string;

  @ApiProperty({ description: 'Website url of company' })
  website: string;

  @ApiProperty({ description: 'Industry url of company' })
  industry: string;
}

class LocationDto {
  @ApiProperty()
  state: string;

  @ApiProperty()
  city: string;
}

export class JobOfferDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: 'Title of job offer' })
  position: string;

  @ApiProperty({ description: 'Working mode of job offer', enum: WorkModeEnum })
  workMode: WorkModeEnum;

  @ApiProperty({ description: 'Employment & contact type' })
  employmentType: string;

  @ApiProperty({ description: 'Minimum experience in year' })
  experienceRequired: number;

  @ApiProperty({ description: 'Minimum salary' })
  minSalary: number;

  @ApiProperty({ description: 'Maximum salary' })
  maxSalary: number;

  @ApiProperty({ description: 'Currency of salary range' })
  currency: string;

  @ApiProperty({ description: 'Detail of company' })
  company: CompanyDto;

  @ApiProperty({ description: 'Location of company' })
  location: LocationDto;

  @ApiProperty({ description: 'List of requirement skills' })
  requirements: string[];
}
