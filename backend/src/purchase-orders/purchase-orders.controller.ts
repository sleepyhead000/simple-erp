import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PoItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;
}

class CreatePurchaseOrderDto {
  @IsString()
  storeId: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoItemDto)
  items: PoItemDto[];
}

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private poService: PurchaseOrdersService) {}

  @Get()
  findAll(
    @Query('store_id') storeId?: string,
    @Query('status') status?: string,
  ) {
    return this.poService.findAll(storeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.poService.findById(id);
  }

  @Roles('admin', 'manager')
  @Post()
  create(@Body() body: CreatePurchaseOrderDto) {
    return this.poService.create(body);
  }

  @Roles('admin', 'manager')
  @Patch(':id/receive')
  receive(@Param('id') id: string) {
    return this.poService.receive(id);
  }

  @Roles('admin', 'manager')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.poService.cancel(id);
  }
}
