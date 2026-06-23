import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FunctionalRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // エンドポイントに設定されたロールを取得
    const requiredFunctionalRoles = this.reflector.get<string[]>(
      'functionalRoles',
      context.getHandler(),
    );

    // ロール指定がなければデフォルト拒否
    if (!requiredFunctionalRoles) {
      throw new ForbiddenException(
        'このエンドポイントにはロールが設定されていません',
      );
    }

    // JWTから取得したユーザー情報を取り出す
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ユーザーのロールが必要なロールに含まれてるかチェック
    if (!requiredFunctionalRoles.includes(user.functionalRoleName)) {
      throw new ForbiddenException('この操作を行う権限がありません');
    }

    return true;
  }
}
