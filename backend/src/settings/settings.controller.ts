import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FunctionalRolesGuard } from '../auth/functional-roles.guard.js';
import { FunctionalRoles } from '../auth/functional-roles.decorator.js';
import { FUNCTIONAL_ROLES } from '../constants/functional-roles.js';
import { SettingsService } from './settings.service.js';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(AuthGuard('jwt'), FunctionalRolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // アカウント
  @Get('users')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'アカウント一覧取得' })
  getUsers(@Request() req: any) {
    return this.settingsService.getUsers(req.user.tenantId);
  }

  @Get('users/:userId')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'アカウント詳細取得' })
  getUser(@Request() req: any, @Param('userId') userId: string) {
    return this.settingsService.getUser(req.user.tenantId, userId);
  }

  @Patch('users/:userId/data-role')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'アカウントのデータロール変更' })
  updateUserDataRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body('dataRoleId') dataRoleId: string,
  ) {
    return this.settingsService.updateUserDataRole(req.user.tenantId, userId, dataRoleId);
  }

  // データロール
  @Get('data-roles')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'データロール一覧取得' })
  getDataRoles(@Request() req: any) {
    return this.settingsService.getDataRoles(req.user.tenantId);
  }

  @Get('data-roles/:dataRoleId')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'データロール詳細取得' })
  getDataRole(@Request() req: any, @Param('dataRoleId') dataRoleId: string) {
    return this.settingsService.getDataRole(req.user.tenantId, dataRoleId);
  }

  @Patch('data-roles/:dataRoleId/namespaces')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'データロールのNamespace設定変更' })
  updateDataRoleNamespaces(
    @Request() req: any,
    @Param('dataRoleId') dataRoleId: string,
    @Body('namespaceIds') namespaceIds: string[],
  ) {
    return this.settingsService.updateDataRoleNamespaces(req.user.tenantId, dataRoleId, namespaceIds);
  }

  // Namespace
  @Get('namespaces')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Namespace一覧取得' })
  getNamespaces(@Request() req: any) {
    return this.settingsService.getNamespaces(req.user.tenantId);
  }
}