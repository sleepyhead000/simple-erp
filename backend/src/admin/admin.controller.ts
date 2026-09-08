import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { IsString, IsOptional, MinLength } from 'class-validator';

class CreateStoreDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  isActive?: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stores')
  getStores() {
    return this.adminService.getStores();
  }

  @Post('stores')
  createStore(@Body() body: CreateStoreDto) {
    return this.adminService.createStore(body);
  }

  @Patch('stores/:id')
  updateStore(@Param('id') id: string, @Body() body: UpdateStoreDto) {
    return this.adminService.updateStore(id, body);
  }

  @Delete('stores/:id')
  deleteStore(@Param('id') id: string) {
    return this.adminService.deleteStore(id);
  }

  @Get('audit-logs')
  getAuditLogs(
    @Query('entity') entity?: string,
    @Query('entity_id') entityId?: string,
    @Query('user_id') userId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit) || 50)) : undefined;
    return this.adminService.getAuditLogs({
      entity,
      entityId,
      userId,
      limit: limitNum,
    });
  }
}
