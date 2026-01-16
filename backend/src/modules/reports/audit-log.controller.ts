import { Controller, ForbiddenException, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLog } from '../../entities/audit-log.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('limit') limitRaw?: string,
    @Query('offset') offsetRaw?: string,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Доступ разрешен только администратору');
    }

    const limit = Math.min(Math.max(Number.parseInt(limitRaw || '100', 10) || 100, 1), 500);
    const offset = Math.max(Number.parseInt(offsetRaw || '0', 10) || 0, 0);

    const [rows, total] = await this.auditLogRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: rows.map(row => ({
        id: row.id,
        action: row.action,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.createdAt,
        userId: row.userId,
        userEmail: row.user?.email || null,
      })),
      total,
      limit,
      offset,
    };
  }
}
