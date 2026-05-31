import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---- テナント ----
  const tenantA = await prisma.tenant.create({
    data: { name: 'A社' },
  });
  const tenantB = await prisma.tenant.create({
    data: { name: 'B社' },
  });

  // ---- Namespace ----
  const nsA = await prisma.namespace.create({
    data: { tenantId: tenantA.id, name: 'Namespace A' },
  });
  const nsB = await prisma.namespace.create({
    data: { tenantId: tenantA.id, name: 'Namespace B' },
  });
  const nsC = await prisma.namespace.create({
    data: { tenantId: tenantA.id, name: 'Namespace C' },
  });
  const nsD = await prisma.namespace.create({
    data: { tenantId: tenantB.id, name: 'Namespace D' },
  });
  const nsE = await prisma.namespace.create({
    data: { tenantId: tenantB.id, name: 'Namespace E' },
  });
  const nsF = await prisma.namespace.create({
    data: { tenantId: tenantB.id, name: 'Namespace F' },
  });

  // ---- 機能ロール ----
  const adminRoleA = await prisma.functionalRole.create({
    data: { tenantId: tenantA.id, name: '管理者' },
  });
  const userRoleA = await prisma.functionalRole.create({
    data: { tenantId: tenantA.id, name: '一般ユーザー' },
  });
  const adminRoleB = await prisma.functionalRole.create({
    data: { tenantId: tenantB.id, name: '管理者' },
  });
  const userRoleB = await prisma.functionalRole.create({
    data: { tenantId: tenantB.id, name: '一般ユーザー' },
  });

  // ---- データロール ----
  const fullAccessA = await prisma.dataRole.create({
    data: { tenantId: tenantA.id, name: '全権限' },
  });
  const limitedAccessA = await prisma.dataRole.create({
    data: { tenantId: tenantA.id, name: '限定権限' },
  });
  const fullAccessB = await prisma.dataRole.create({
    data: { tenantId: tenantB.id, name: '全権限' },
  });
  const limitedAccessB = await prisma.dataRole.create({
    data: { tenantId: tenantB.id, name: '限定権限' },
  });

  // ---- データロール - Namespace 紐づけ ----
  // A社全権限：A, B, C すべて
  await prisma.dataRoleNamespace.createMany({
    data: [
      { tenantId: tenantA.id, dataRoleId: fullAccessA.id, namespaceId: nsA.id },
      { tenantId: tenantA.id, dataRoleId: fullAccessA.id, namespaceId: nsB.id },
      { tenantId: tenantA.id, dataRoleId: fullAccessA.id, namespaceId: nsC.id },
    ],
  });
  // A社限定権限：A のみ
  await prisma.dataRoleNamespace.create({
    data: { tenantId: tenantA.id, dataRoleId: limitedAccessA.id, namespaceId: nsA.id },
  });
  // B社全権限：D, E, F すべて
  await prisma.dataRoleNamespace.createMany({
    data: [
      { tenantId: tenantB.id, dataRoleId: fullAccessB.id, namespaceId: nsD.id },
      { tenantId: tenantB.id, dataRoleId: fullAccessB.id, namespaceId: nsE.id },
      { tenantId: tenantB.id, dataRoleId: fullAccessB.id, namespaceId: nsF.id },
    ],
  });
  // B社限定権限：D のみ
  await prisma.dataRoleNamespace.create({
    data: { tenantId: tenantB.id, dataRoleId: limitedAccessB.id, namespaceId: nsD.id },
  });

  // ---- ユーザー ----
  const password = await bcrypt.hash('password123', 10);

  // ユーザーA：A社管理者
  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      name: 'ユーザーA',
      email: 'user-a@example.com',
      passwordHash: password,
      functionalRoleId: adminRoleA.id,
      dataRoleId: fullAccessA.id,
    },
  });
  // ユーザーB：A社一般ユーザー
  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      name: 'ユーザーB',
      email: 'user-b@example.com',
      passwordHash: password,
      functionalRoleId: userRoleA.id,
      dataRoleId: limitedAccessA.id,
    },
  });
  // ユーザーC：B社管理者
  await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      name: 'ユーザーC',
      email: 'user-c@example.com',
      passwordHash: password,
      functionalRoleId: adminRoleB.id,
      dataRoleId: fullAccessB.id,
    },
  });
  // ユーザーD：B社一般ユーザー
  await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      name: 'ユーザーD',
      email: 'user-d@example.com',
      passwordHash: password,
      functionalRoleId: userRoleB.id,
      dataRoleId: limitedAccessB.id,
    },
  });

  console.log('✅ シードデータ投入完了');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });