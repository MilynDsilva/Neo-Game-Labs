import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Controller('health')
export class ReadinessController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
  ) {}

  @Get('ready')
  getReadiness() {
    if (this.databaseConnection.readyState !== 1) {
      throw new ServiceUnavailableException('Database is not ready');
    }
    return {
      checks: { mongodb: 'ok' as const },
      service: 'customer-api' as const,
      status: 'ready' as const,
      timestamp: new Date().toISOString(),
    };
  }
}
