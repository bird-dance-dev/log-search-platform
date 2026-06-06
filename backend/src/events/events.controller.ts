import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FunctionalRolesGuard } from '../auth/functional-roles.guard.js';
import { FunctionalRoles } from '../auth/functional-roles.decorator.js';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { BulkCreateEventDto } from './dto/bulk-create-event.dto.js';
import { SearchEventDto } from './dto/search-event.dto.js';
import { FUNCTIONAL_ROLES } from '../constants/functional-roles.js';

@ApiTags('Events')
@Controller('events')
@UseGuards(AuthGuard('jwt'), FunctionalRolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER)
  @ApiOperation({ summary: 'イベント1件登録', description: '監査ログイベントを1件登録する' })
  @ApiResponse({ status: 201, description: '登録成功' })
  create(@Request() req: any, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.tenantId, createEventDto);
  }

  @Post('bulk')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER)
  @ApiOperation({ summary: 'イベント一括登録', description: '監査ログイベントを一括登録する' })
  @ApiResponse({ status: 201, description: '登録成功' })
  createBulk(@Request() req: any, @Body() bulkCreateEventDto: BulkCreateEventDto) {
    return this.eventsService.createBulk(req.user.tenantId, bulkCreateEventDto.events);
  }

  @Get()
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER)
  @ApiOperation({ summary: 'イベント検索', description: 'UDMフィールドのfilter条件でイベントを検索する' })
  @ApiResponse({ status: 200, description: '検索成功' })
  search(@Request() req: any, @Query() searchEventDto: SearchEventDto) {
    return this.eventsService.search(req.user.tenantId, searchEventDto);
  }

  @Get(':id')
  @FunctionalRoles(FUNCTIONAL_ROLES.ADMIN, FUNCTIONAL_ROLES.USER)
  @ApiOperation({ summary: 'イベント詳細取得', description: '指定IDのイベントをsecurityResults含めて取得する' })
  @ApiResponse({ status: 200, description: '取得成功' })
  @ApiResponse({ status: 404, description: 'イベントが見つからない' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.findOne(req.user.tenantId, id);
  }
}
