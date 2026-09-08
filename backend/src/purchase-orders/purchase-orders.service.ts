import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId?: string) {
    const where = storeId ? { storeId } : {};
    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        store: true,
      },
    });
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }
    return po;
  }

  async create(data: {
    storeId: string;
    supplier?: string;
    items: Array<{ productId: string; quantity: number; unitCost: number }>;
  }) {
    return this.prisma.purchaseOrder.create({
      data: {
        storeId: data.storeId,
        supplier: data.supplier,
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async receive(id: string) {
    const po = await this.findById(id);

    if (po.status !== 'ordered') {
      throw new BadRequestException('Only ordered POs can be received');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      for (const item of po.items) {
        await tx.inventory.upsert({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: po.storeId,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            productId: item.productId,
            storeId: po.storeId,
            quantity: item.quantity,
          },
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'received' },
      });
    });

    return result;
  }

  async cancel(id: string) {
    const po = await this.findById(id);

    if (po.status === 'received') {
      throw new BadRequestException('Cannot cancel a received PO');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
