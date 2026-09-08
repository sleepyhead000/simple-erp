import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId?: string) {
    const where = storeId ? { storeId } : {};
    return this.prisma.inventory.findMany({
      where,
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findByProductAndStore(productId: string, storeId: string) {
    return this.prisma.inventory.findUnique({
      where: {
        productId_storeId: { productId, storeId },
      },
      include: {
        product: true,
      },
    });
  }

  async adjustStock(data: {
    productId: string;
    storeId: string;
    quantity: number;
    reason?: string;
    userId: string;
  }) {
    if (data.quantity === 0) {
      throw new BadRequestException('Adjustment quantity cannot be zero');
    }

    const existing = await this.prisma.inventory.findUnique({
      where: {
        productId_storeId: {
          productId: data.productId,
          storeId: data.storeId,
        },
      },
    });

    if (existing && existing.quantity + data.quantity < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${existing.quantity}, adjustment: ${data.quantity}`,
      );
    }

    const inventory = await this.prisma.inventory.upsert({
      where: {
        productId_storeId: {
          productId: data.productId,
          storeId: data.storeId,
        },
      },
      update: {
        quantity: { increment: data.quantity },
      },
      create: {
        productId: data.productId,
        storeId: data.storeId,
        quantity: Math.max(0, data.quantity),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: 'stock_adjustment',
        entity: 'inventory',
        entityId: inventory.id,
        metadata: JSON.stringify({
          productId: data.productId,
          storeId: data.storeId,
          adjustment: data.quantity,
          reason: data.reason,
        }),
      },
    });

    return inventory;
  }

  async getLowStockItems(storeId?: string) {
    const where: any = storeId ? { storeId } : {};
    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        product: true,
      },
    });
    return items.filter((item) => item.quantity <= item.reorderPoint);
  }
}
