import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getNamespaces(tenantId: string) {
    return this.prisma.namespace.findMany({
      where: { tenantId },
    });
  }
}