import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from './admin.guard.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('games')
  listGames() {
    return this.adminService.listGames();
  }

  @Patch('games/:id')
  updateGame(
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('x-admin-actor') actor = 'admin-dashboard',
  ) {
    return this.adminService.updateGame(id, body, actor);
  }

  @Get('feedback')
  listFeedback(@Query('status') status?: string) {
    return this.adminService.listFeedback(status);
  }

  @Patch('feedback/:id')
  updateFeedback(
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('x-admin-actor') actor = 'admin-dashboard',
  ) {
    return this.adminService.updateFeedback(id, body, actor);
  }

  @Get('customers')
  listCustomers(
    @Query('search') search = '',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listCustomers({ limit, page, search });
  }

  @Get('audit')
  listAudit() {
    return this.adminService.listAudit();
  }

  @Post('customers/:id/credits')
  creditCustomer(
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('x-admin-actor') actor = 'admin-dashboard',
  ) {
    return this.adminService.creditCustomer(id, body, actor);
  }
}
