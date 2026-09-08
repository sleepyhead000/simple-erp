import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('sales-summary')
  getSalesSummary(
    @Query('store_id') storeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportingService.getSalesSummary({
      storeId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('inventory-turnover')
  getInventoryTurnover(@Query('store_id') storeId?: string) {
    return this.reportingService.getInventoryTurnover({ storeId });
  }
}
