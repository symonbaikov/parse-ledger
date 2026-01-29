import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import type { Repository } from 'typeorm';
import { WorkspaceMember } from '../../entities/workspace-member.entity';

@Injectable()
export class WorkspaceContextGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { workspace?: any; user?: any; workspaceRole?: string }>();
    const workspaceId = request.headers['x-workspace-id'] as string;
    const user = request.user;

    if (!workspaceId) {
      throw new ForbiddenException('Workspace context is required');
    }

    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: user.id },
      relations: ['workspace'],
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    request.workspace = membership.workspace;
    request.workspaceRole = membership.role;

    return true;
  }
}
