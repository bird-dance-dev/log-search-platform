import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { SearchEventDto } from './dto/search-event.dto.js';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateEventDto) {
        return this.prisma.event.create({
            data: {
                tenantId: 'TODO',
                namespaceId: 'TODO',
                metadata_eventTimestamp: new Date(dto.metadata_eventTimestamp),
                metadata_eventType: dto.metadata_eventType,
                metadata_logType: dto.metadata_logType,
                metadata_vendorName: dto.metadata_vendorName,
                metadata_productName: dto.metadata_productName,
                principal_hostname: dto.principal_hostname,
                principal_ip: dto.principal_ip,
                principal_user_userid: dto.principal_user_userid,
                principal_user_email: dto.principal_user_email,
                principal_process_pid: dto.principal_process_pid,
                principal_process_commandLine: dto.principal_process_commandLine,
                target_hostname: dto.target_hostname,
                target_ip: dto.target_ip,
                target_user_userid: dto.target_user_userid,
                target_user_email: dto.target_user_email,
                target_url: dto.target_url,
                target_resourceName: dto.target_resourceName,
                securityResults: dto.securityResults
                ? {
                    create: dto.securityResults.map((sr) => ({
                        action: sr.action,
                        severity: sr.severity,
                        description: sr.description,
                        category: sr.category,
                    })),
                    }
                : undefined,
            },
            include: { securityResults: true },
        });
    }

    async createBulk(dtos: CreateEventDto[]) {

        // 1. eventsを一括INSERT
        await this.prisma.event.createMany({
            data: dtos.map((dto) => ({
                tenantId: 'TODO',
                namespaceId: 'TODO',
                metadata_eventTimestamp: new Date(dto.metadata_eventTimestamp),
                metadata_eventType: dto.metadata_eventType,
                metadata_logType: dto.metadata_logType,
                metadata_vendorName: dto.metadata_vendorName,
                metadata_productName: dto.metadata_productName,
                principal_hostname: dto.principal_hostname,
                principal_ip: dto.principal_ip,
                principal_user_userid: dto.principal_user_userid,
                principal_user_email: dto.principal_user_email,
                principal_process_pid: dto.principal_process_pid,
                principal_process_commandLine: dto.principal_process_commandLine,
                target_hostname: dto.target_hostname,
                target_ip: dto.target_ip,
                target_user_userid: dto.target_user_userid,
                target_user_email: dto.target_user_email,
                target_url: dto.target_url,
                target_resourceName: dto.target_resourceName,
            })),
        });

        // 2. 作成したeventsのIDを取得（直近のN件）
        const createdEvents = await this.prisma.event.findMany({
            orderBy: { metadata_ingestedTimestamp: 'desc' },
            take: dtos.length,
            select: { id: true },
        });

        // 3. securityResultsを一括INSERT
        const securityResultsData = dtos.flatMap((dto, index) => {
            if (!dto.securityResults?.length) return [];
            const eventId = createdEvents[index]?.id;
            if (!eventId) return [];
            return dto.securityResults.map((sr) => ({
                eventId,
                action: sr.action,
                severity: sr.severity,
                description: sr.description,
                category: sr.category,
            }));
        });

        if (securityResultsData.length > 0) {
            await this.prisma.securityResult.createMany({
                data: securityResultsData,
            });
        }

        return { count: dtos.length, message: `${dtos.length} events created successfully` };
    }

    async search(dto: SearchEventDto) {
        const page = Number(dto.page) || 1;
        const limit = Number(dto.limit) || 50;
        const skip = (page - 1) * limit;
        
        const where: any = {};

        if (dto.startTime || dto.endTime) {
            where.metadata_eventTimestamp = {};
            if (dto.startTime) {
                where.metadata_eventTimestamp.gte = new Date(dto.startTime);
            }
            if (dto.endTime) {
                where.metadata_eventTimestamp.lte = new Date(dto.endTime);
            }
        }

        if (dto.filter) {
            const filterConditions = this.parserFilter(dto.filter);
            Object.assign(where, filterConditions);
        }

        const [data, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {securityResults: true },
                orderBy: {metadata_eventTimestamp: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { securityResults: true },
        });

        if (!event) {
            throw new NotFoundException(`Event ${id} not found`);
        }

        return event;
    }

    private parserFilter(filter: string): any {
        // OR で分割
        const orGroups = filter.split(/\s+OR\s+/);

        if (orGroups.length > 1) {
            return {
                OR: orGroups.map((group) => this.parseAndGroup(group)),
            };
        }

        return this.parseAndGroup(filter);
    }

    private parseAndGroup(group: string): any {
        const conditions = group.split(/\s+AND\s+/);
        const where: any = {};

        for (const condition of conditions) {
        const parsed = this.parseCondition(condition.trim());
        if (parsed) {
            Object.assign(where, parsed);
        }
        }

        return where;
    }

    private parseCondition(condition: string): any {
        // LIKE: field LIKE "value"
        const likeMatch = condition.match(/^(\w+)\s+LIKE\s+"(.+)"$/);
        if (likeMatch) {
        const [, field, value] = likeMatch;
        return { [field]: { contains: value, mode: 'insensitive' } };
        }

        // !=: field!="value"
        const neqMatch = condition.match(/^(\w+)\s*!=\s*"(.+)"$/);
        if (neqMatch) {
        const [, field, value] = neqMatch;
        return { [field]: { not: value } };
        }

        // =: field="value"
        const eqMatch = condition.match(/^(\w+)\s*=\s*"(.+)"$/);
        if (eqMatch) {
        const [, field, value] = eqMatch;
        return { [field]: value };
        }

        return null;
    }
}
