import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    cursor?: { id: string };
    where?: any;
    orderBy?: any;
  }) {
    const { skip, take, cursor, where, orderBy } = params || {};
    return this.prisma.product.findMany({
      skip,
      take: take || 50,
      cursor,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySku(sku: string) {
    return this.prisma.product.findUnique({
      where: { sku },
    });
  }

  async create(data: {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    cost?: number;
  }) {
    return this.prisma.product.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      sku?: string;
      name?: string;
      description?: string;
      category?: string;
      price?: number;
      cost?: number;
    },
  ) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async count(where?: any) {
    return this.prisma.product.count({ where });
  }
}
