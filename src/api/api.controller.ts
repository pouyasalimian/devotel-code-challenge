import { Controller, Logger } from '@nestjs/common';

@Controller('')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);
}
