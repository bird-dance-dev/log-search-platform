import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

// 認証エラーメッセージ
const INVALID_CREDENTIALS_MESSAGE =
  'メールアドレスまたはパスワードが正しくありません';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // メールアドレスでユーザーを検索
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { functionalRole: true },
    });

    // ユーザーが見つからなければエラー
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    // パスワードの照合
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    // JWTトークンを生成して返す
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      functionalRoleId: user.functionalRoleId,
      functionalRoleName: user.functionalRole.name,
      dataRoleId: user.dataRoleId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
