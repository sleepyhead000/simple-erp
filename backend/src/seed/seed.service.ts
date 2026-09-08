import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email = 'admin@gmail.com';
    const password = 'admin123';

    try {
      const existing = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'admin',
        },
      });

      this.logger.log(`Seeded admin user: ${email}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
