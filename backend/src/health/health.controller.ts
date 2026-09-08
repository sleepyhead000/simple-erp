import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const dbHealth = await this.prisma.checkHealth();

    return {
      status: dbHealth.database === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth.database,
      provider: this.prisma.getProvider(),
    };
  }
}
