import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private isSQLite: boolean;

  constructor() {
    super();
    this.isSQLite = process.env.DATABASE_URL?.includes('file:') ?? false;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async checkHealth(): Promise<{ database: string }> {
    try {
      if (this.isSQLite) {
        await this.$queryRaw`SELECT 1`;
      } else {
        await this.$queryRaw`SELECT 1`;
      }
      return { database: 'ok' };
    } catch {
      return { database: 'error' };
    }
  }

  getProvider(): string {
    return this.isSQLite ? 'sqlite' : 'postgresql';
  }
}
