import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
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

    return this.prisma.salesTransaction.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        store: true,
        cashier: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.salesTransaction.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        store: true,
        cashier: {
          select: { id: true, email: true },
        },
      },
    });
  }

  async create(data: {
    storeId: string;
    cashierId: string;
    paymentMethod: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  }) {
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const inventory = await tx.inventory.findUnique({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: data.storeId,
            },
          },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }

        await tx.inventory.update({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: data.storeId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      return tx.salesTransaction.create({
        data: {
          storeId: data.storeId,
          cashierId: data.cashierId,
          total,
          paymentMethod: data.paymentMethod,
          items: {
            create: data.items,
          },
        },
        include: { items: true },
      });
    });

    return result;
  }

  async refund(id: string) {
    const sale = await this.findById(id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    if (sale.status !== 'completed') {
      throw new BadRequestException('Only completed sales can be refunded');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.inventory.update({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: sale.storeId,
            },
          },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      return tx.salesTransaction.update({
        where: { id },
        data: { status: 'refunded' },
      });
    });

    return result;
  }
}
