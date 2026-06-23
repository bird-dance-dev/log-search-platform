import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// bcrypt.compareをモック化
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // テスト用のユーザーデータ
  const mockUser = {
    id: 'user-1',
    email: 'user-a@example.com',
    passwordHash: 'hashed-password',
    tenantId: 'tenant-a',
    functionalRoleId: 'role-admin',
    dataRoleId: 'data-role-full',
    functionalRole: {
      id: 'role-admin',
      name: '管理者',
      tenantId: 'tenant-a',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('正しい認証情報でJWTトークンが返却される', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(
        'user-a@example.com',
        'password123',
      );

      // Assert
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenantId,
        functionalRoleId: mockUser.functionalRoleId,
        functionalRoleName: '管理者',
        dataRoleId: mockUser.dataRoleId,
      });
    });

    it('存在しないメールアドレスで401エラー', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const act = authService.login('nonexistent@example.com', 'password123');

      // Assert
      await expect(act).rejects.toThrow(UnauthorizedException);
    });

    it('パスワード不一致で401エラー', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const act = authService.login('user-a@example.com', 'wrong-password');

      // Assert
      await expect(act).rejects.toThrow(UnauthorizedException);
    });

    it('メール不一致とパスワード不一致で同一のエラーメッセージが返る（情報漏洩防止）', async () => {
      // Arrange: メールが存在しないケース
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      let emailError: UnauthorizedException | undefined;
      try {
        await authService.login('nonexistent@example.com', 'password123');
      } catch (e) {
        emailError = e as UnauthorizedException;
      }

      // Arrange: パスワードが不一致のケース
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      let passwordError: UnauthorizedException | undefined;
      try {
        await authService.login('user-a@example.com', 'wrong-password');
      } catch (e) {
        passwordError = e as UnauthorizedException;
      }

      // Assert: エラーメッセージが同一であること
      expect(emailError!.message).toBe(passwordError!.message);
    });

    it('findUniqueにfunctionalRoleのincludeが指定されている', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await authService.login('user-a@example.com', 'password123');

      // Assert: functionalRoleをincludeしてロール名を取得している
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user-a@example.com' },
        include: { functionalRole: true },
      });
    });
  });
});
