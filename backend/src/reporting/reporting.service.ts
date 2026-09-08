import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(params?: {
    storeId?: string;
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};
    if (params?.storeId) where.storeId = params.storeId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    const [totalSales, totalTransactions, salesByStore] = await Promise.all([
      this.prisma.salesTransaction.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.salesTransaction.count({
        where: { ...where, status: 'completed' },
      }),
      this.prisma.salesTransaction.groupBy({
        by: ['storeId'],
        where: { ...where, status: 'completed' },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      totalRevenue: totalSales._sum.total || 0,
      totalTransactions,
      averageTransactionValue:
        totalTransactions > 0
          ? Number(totalSales._sum.total || 0) / totalTransactions
          : 0,
      byStore: salesByStore,
    };
  }

  async getInventoryTurnover(params?: { storeId?: string }) {
    const where: any = {};
    if (params?.storeId) where.storeId = params.storeId;

    const inventory = await this.prisma.inventory.findMany({
      where,
      include: { product: true },
    });

    return inventory.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      storeId: item.storeId,
      currentStock: item.quantity,
      reorderPoint: item.reorderPoint,
      needsReorder: item.quantity <= item.reorderPoint,
    }));
  }
}
