import { FunctionalRolesGuard } from './functional-roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FUNCTIONAL_ROLES } from '../constants/functional-roles';

describe('FunctionalRolesGuard', () => {
  let guard: FunctionalRolesGuard;
  let reflector: Reflector;

  // モック化されたExecutionContextを生成するヘルパー
  const createMockContext = (user: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new FunctionalRolesGuard(reflector);
  });

  describe('default-deny（ロール未設定のエンドポイント）', () => {
    it('デコレータ未設定の場合、ForbiddenExceptionをスローする', () => {
      // Arrange: デコレータなし → reflector.getがundefinedを返す
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);
      const context = createMockContext({
        functionalRoleName: FUNCTIONAL_ROLES.ADMIN,
      });

      // Act
      const act = () => guard.canActivate(context);

      // Assert
      expect(act).toThrow(ForbiddenException);
      expect(act).toThrow('このエンドポイントにはロールが設定されていません');
    });
  });

  describe('機能ロールによるアクセス制御', () => {
    it('許可ロールに含まれている場合、trueを返す', () => {
      // Arrange: 管理者ロールが許可されたエンドポイント
      jest
        .spyOn(reflector, 'get')
        .mockReturnValue([FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER]);
      const context = createMockContext({
        functionalRoleName: FUNCTIONAL_ROLES.ADMIN,
      });

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('一般ユーザーでも許可ロールに含まれていれば通過する', () => {
      // Arrange
      jest
        .spyOn(reflector, 'get')
        .mockReturnValue([FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER]);
      const context = createMockContext({
        functionalRoleName: FUNCTIONAL_ROLES.USER,
      });

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('管理者限定エンドポイントに一般ユーザーがアクセスすると403', () => {
      // Arrange: 管理者のみ許可（settingsエンドポイント相当）
      jest.spyOn(reflector, 'get').mockReturnValue([FUNCTIONAL_ROLES.ADMIN]);
      const context = createMockContext({
        functionalRoleName: FUNCTIONAL_ROLES.USER,
      });

      // Act
      const act = () => guard.canActivate(context);

      // Assert
      expect(act).toThrow(ForbiddenException);
      expect(act).toThrow('この操作を行う権限がありません');
    });

    it('未知のロール名ではアクセスが拒否される', () => {
      // Arrange
      jest
        .spyOn(reflector, 'get')
        .mockReturnValue([FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER]);
      const context = createMockContext({
        functionalRoleName: '未知のロール',
      });

      // Act
      const act = () => guard.canActivate(context);

      // Assert
      expect(act).toThrow(ForbiddenException);
    });
  });
});
