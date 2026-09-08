import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

class AdjustStockDto {
  @IsString()
  productId: string;

  @IsString()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  findAll(@Query('store_id') storeId?: string) {
    return this.inventoryService.findAll(storeId);
  }

  @Roles('admin', 'manager')
  @Post('adjust')
  async adjustStock(@Body() body: AdjustStockDto, @Request() req: any) {
    return this.inventoryService.adjustStock({
      ...body,
      userId: req.user.id,
    });
  }

  @Get('low-stock')
  getLowStock(@Query('store_id') storeId?: string) {
    return this.inventoryService.getLowStockItems(storeId);
  }
}
