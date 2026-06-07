import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // ユーザー一覧取得
  async getUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      omit: { passwordHash: true },
      include: { functionalRole: true, dataRole: true },
    });
  }

  // ユーザー情報個別取得
  async getUser(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, id: userId },
      omit: { passwordHash: true },
      include: { functionalRole: true, dataRole: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user;
  }

  // ユーザーデータロール更新
  async updateUserDataRole(tenantId: string, userId: string, dataRoleId: string) {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return this.prisma.user.update({
      where: { tenantId_id: { tenantId, id: userId } },
      data: { dataRoleId },
      omit: { passwordHash: true },
      include: { functionalRole: true, dataRole: true },
    });
  }

  // データロール一覧取得
  async getDataRoles(tenantId: string) {
    return this.prisma.dataRole.findMany({
      where: { tenantId },
      include: { namespaces: { include: { namespace: true } } },
    });
  }

  // データロール個別取得
  async getDataRole(tenantId: string, dataRoleId: string) {
    const dataRole = await this.prisma.dataRole.findFirst({
      where: { tenantId, id: dataRoleId },
      include: { namespaces: { include: { namespace: true } } },
    });
    if (!dataRole) {
      throw new NotFoundException(`DataRole ${dataRoleId} not found`);
    }
    return dataRole;
  }

  // Namespace一覧取得
  async getNamespaces(tenantId: string) {
    return this.prisma.namespace.findMany({
      where: { tenantId },
    });
  }

  // データロールのnamespace更新
  async updateDataRoleNamespaces(tenantId: string, dataRoleId: string, namespaceIds: string[]) {
    const dataRole = await this.prisma.dataRole.findFirst({
      where: { tenantId, id: dataRoleId },
    });
    if (!dataRole) {
      throw new NotFoundException(`DataRole ${dataRoleId} not found`);
    }

    // 既存の紐づけを全削除
    await this.prisma.dataRoleNamespace.deleteMany({
      where: { tenantId, dataRoleId },
    });

    // 新しい紐づけを作成
    if (namespaceIds.length > 0) {
      await this.prisma.dataRoleNamespace.createMany({
        data: namespaceIds.map(namespaceId => ({
          tenantId,
          dataRoleId,
          namespaceId,
        })),
      });
    }

    // 更新後のデータロールを返す
    return this.prisma.dataRole.findFirst({
      where: { tenantId, id: dataRoleId },
      include: { namespaces: { include: { namespace: true } } },
    });
  }
}