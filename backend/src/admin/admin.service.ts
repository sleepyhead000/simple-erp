import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStores() {
    return this.prisma.store.findMany({
      include: {
        _count: {
          select: {
            users: true,
            inventory: true,
          },
        },
      },
    });
  }

  async createStore(data: { name: string; address?: string; phone?: string }) {
    return this.prisma.store.create({ data });
  }

  async updateStore(id: string, data: { name?: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async deleteStore(id: string) {
    return this.prisma.store.delete({
      where: { id },
    });
  }

  async getAuditLogs(params?: {
    entity?: string;
    entityId?: string;
    userId?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (params?.entity) where.entity = params.entity;
    if (params?.entityId) where.entityId = params.entityId;
    if (params?.userId) where.userId = params.userId;

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 100,
    });
  }
}
