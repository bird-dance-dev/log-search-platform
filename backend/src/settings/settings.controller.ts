import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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

  @Get('namespaces')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Namespace一覧取得' })
  getNamespaces(@Request() req: any) {
    return this.settingsService.getNamespaces(req.user.tenantId);
  }
}