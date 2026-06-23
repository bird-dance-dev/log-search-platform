import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('認証認可 (e2e)', () => {
  let app: INestApplication;

  // 各ユーザーのトークンを保持
  let tokenAdminA: string; // ユーザーA: A社管理者・全権限
  let tokenUserB: string; // ユーザーB: A社一般ユーザー・限定権限
  let tokenAdminC: string; // ユーザーC: B社管理者・全権限

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // seedデータのユーザーでログインしてトークンを取得
    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-a@example.com', password: 'password123' });
    tokenAdminA = loginA.body.accessToken;

    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-b@example.com', password: 'password123' });
    tokenUserB = loginB.body.accessToken;

    const loginC = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-c@example.com', password: 'password123' });
    tokenAdminC = loginC.body.accessToken;
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.$disconnect();
    await app.close();
  });

  describe('認証', () => {
    it('トークンなしでアクセスすると401', async () => {
      const res = await request(app.getHttpServer()).get('/events');

      expect(res.status).toBe(401);
    });

    it('ログインしてトークンを取得できる', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user-a@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('機能ロール', () => {
    it('一般ユーザーでsettings（管理者限定）を叩くと403', async () => {
      const res = await request(app.getHttpServer())
        .get('/settings/users')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
    });

    it('管理者でsettingsにアクセスできる', async () => {
      const res = await request(app.getHttpServer())
        .get('/settings/users')
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.status).toBe(200);
    });
  });

  describe('テナント分離', () => {
    it('テナントAのトークンで検索すると、テナントBのイベントが含まれない', async () => {
      // テナントAで検索
      const resA = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${tokenAdminA}`);

      // テナントBで検索
      const resC = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${tokenAdminC}`);

      expect(resA.status).toBe(200);
      expect(resC.status).toBe(200);

      // それぞれのイベントIDが重複しないことを確認
      const idsA = resA.body.data.map((e: any) => e.id);
      const idsC = resC.body.data.map((e: any) => e.id);
      const overlap = idsA.filter((id: string) => idsC.includes(id));

      expect(overlap).toHaveLength(0);
    });
  });

  describe('データロール', () => {
    it('限定権限ユーザーで検索すると、許可されたnamespaceのイベントのみ返る', async () => {
      // ユーザーB: A社一般ユーザー・限定権限（Namespace Aのみ）
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(200);

      // 全イベントのnamespaceIdを取得
      const namespaceIds = res.body.data.map((e: any) => e.namespaceId);
      const uniqueNamespaceIds = [...new Set(namespaceIds)];

      // 1つのnamespaceしか含まれないことを確認
      expect(uniqueNamespaceIds).toHaveLength(1);
    });
  });
});
