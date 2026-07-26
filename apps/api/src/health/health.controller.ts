import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@neogamelabs/contracts';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      service: 'customer-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
