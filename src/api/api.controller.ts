import {
  Controller,
  Get,
  Logger,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FetchService } from 'src/domain/services/fetch/fetch.service';
import { JobOfferService } from 'src/domain/services/job-offer/job-offer.service';
import { JobOfferDto } from 'src/dto/job-offer.dto';
import { WorkModeEnum } from 'src/enums/work-mode.enum';

@ApiExtraModels(JobOfferDto)
@Controller('api')
@ApiTags('Job Offers')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(
    private readonly fetchService: FetchService,
    private readonly JobOfferService: JobOfferService,
  ) {}

  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search job position',
  })
  @ApiQuery({
    name: 'workMode',
    required: false,
    enum: WorkModeEnum,
    description: 'Work mode filter',
  })
  @ApiQuery({
    name: 'minSalary',
    required: false,
    type: Number,
    description: 'Minimum salary',
  })
  @ApiQuery({
    name: 'maxSalary',
    required: false,
    type: Number,
    description: 'Maximum salary',
  })
  @ApiQuery({
    name: 'companyName',
    required: false,
    type: String,
    description: 'Filter by company name',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'Filter by state',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
  })
  @ApiQuery({
    name: 'requirements',
    required: false,
    isArray: true,
    type: String,
    description: 'Filter by job requirements (comma-separated)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: { $ref: getSchemaPath(JobOfferDto) } },
        pageInfo: {
          properties: {
            total: { type: 'number' },
            hasNextPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      properties: {
        success: { type: 'boolean', default: false },
        message: { type: 'string' },
      },
    },
  })
  @Get('job-offers')
  async getJobOffers(
    @Query('search') search?: string,
    @Query('workMode', new ParseEnumPipe(WorkModeEnum, { optional: true }))
    workMode?: WorkModeEnum,
    @Query('minSalary', new ParseIntPipe({ optional: true }))
    minSalary?: number,
    @Query('maxSalary', new ParseIntPipe({ optional: true }))
    maxSalary?: number,
    @Query('companyName') companyName?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('requirements') requirements?: string[],
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
  ) {
    const options = {
      search,
      workMode,
      minSalary,
      maxSalary,
      companyName,
      state,
      city,
      requirements,
      page,
      pageSize,
    };

    return this.JobOfferService.getJobOffers(options);
  }
}
