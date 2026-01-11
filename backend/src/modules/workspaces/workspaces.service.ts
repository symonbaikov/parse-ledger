import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { retry, TimeoutError, withTimeout } from '../../common/utils/async.util';
import {
  User,
  Workspace,
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
  WorkspaceMember,
  WorkspaceRole,
  type WorkspaceMemberPermissions,
} from '../../entities';
import {
  WorkspaceInvitationEmail,
  workspaceInvitationEmailText,
} from '../../emails/workspace-invitation.email';
import { InviteMemberDto } from './dto/invite-member.dto';

const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvitation)
    private readonly invitationRepository: Repository<WorkspaceInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async ensureUserWorkspace(user: User): Promise<Workspace> {
    if (user.workspaceId) {
      const existing = await this.workspaceRepository.findOne({
        where: { id: user.workspaceId },
      });
      if (existing) {
        return existing;
      }
    }

    const workspace = this.workspaceRepository.create({
      name: `${user.name || user.email} workspace`,
      ownerId: user.id,
    });
    const savedWorkspace = await this.workspaceRepository.save(workspace);

    await this.workspaceMemberRepository.save({
      workspaceId: savedWorkspace.id,
      userId: user.id,
      role: WorkspaceRole.OWNER,
      invitedById: user.id,
    });

    await this.userRepository.update(user.id, { workspaceId: savedWorkspace.id });

    return savedWorkspace;
  }

  async getWorkspaceOverview(currentUser: User) {
    const workspace = await this.ensureUserWorkspace(currentUser);

    const members = await this.workspaceMemberRepository.find({
      where: { workspaceId: workspace.id },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const invitations = await this.invitationRepository.find({
      where: { workspaceId: workspace.id, status: WorkspaceInvitationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
      },
      members: members.map((member) => ({
        id: member.userId,
        email: member.user?.email,
        name: member.user?.name,
        role: member.role,
        permissions: member.permissions,
        joinedAt: member.createdAt,
      })),
      invitations: invitations.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        permissions: invite.permissions,
        status: invite.status,
        token: invite.token,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        link: this.buildInvitationLink(invite.token),
      })),
    };
  }

  private async requireAdminMembership(workspaceId: string, userId: string) {
    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('Вы не состоите в этом рабочем пространстве');
    }

    if (![WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(membership.role)) {
      throw new ForbiddenException('Только владелец или администратор может приглашать участников');
    }

    return membership;
  }

  async inviteMember(currentUser: User, dto: InviteMemberDto) {
    const workspace = await this.ensureUserWorkspace(currentUser);
    await this.requireAdminMembership(workspace.id, currentUser.id);

    const email = dto.email.trim().toLowerCase();
    const role = dto.role || WorkspaceRole.MEMBER;
    const permissions: WorkspaceMemberPermissions | null =
      role === WorkspaceRole.MEMBER ? ((dto.permissions as WorkspaceMemberPermissions | undefined) ?? null) : null;

    const existingUser = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'workspaceId'],
    });

    if (existingUser) {
      const existingMembership = await this.workspaceMemberRepository.findOne({
        where: { workspaceId: workspace.id, userId: existingUser.id },
      });

      if (existingMembership) {
        throw new ConflictException('Пользователь уже в рабочем пространстве');
      }
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: { workspaceId: workspace.id, email, status: WorkspaceInvitationStatus.PENDING },
    });

    if (existingInvitation) {
      existingInvitation.expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
      existingInvitation.role = role;
      existingInvitation.permissions = permissions;
      existingInvitation.invitedById = currentUser.id;
      existingInvitation.token = uuidv4();
      const updated = await this.invitationRepository.save(existingInvitation);
      const invitationLink = this.buildInvitationLink(updated.token);
      await this.sendInvitationEmail({
        email,
        workspaceName: workspace.name,
        invitationLink,
        invitedBy: currentUser.name || currentUser.email,
        role,
      });
      return { invitation: updated, invitationLink };
    }

    const invitation = this.invitationRepository.create({
      workspaceId: workspace.id,
      email,
      role,
      permissions,
      token: uuidv4(),
      status: WorkspaceInvitationStatus.PENDING,
      invitedById: currentUser.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    });

    const savedInvitation = await this.invitationRepository.save(invitation);
    const invitationLink = this.buildInvitationLink(savedInvitation.token);
    await this.sendInvitationEmail({
      email,
      workspaceName: workspace.name,
      invitationLink,
      invitedBy: currentUser.name || currentUser.email,
      role,
    });

    return { invitation: savedInvitation, invitationLink };
  }

  private buildInvitationLink(token: string) {
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/invite/${token}`;
  }

  async getInvitationInfo(token: string) {
    const trimmedToken = token?.trim();
    if (!trimmedToken) {
      throw new BadRequestException('Некорректный токен приглашения');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { token: trimmedToken },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено');
    }

    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      if (invitation.status === WorkspaceInvitationStatus.PENDING) {
        invitation.status = WorkspaceInvitationStatus.EXPIRED;
        await this.invitationRepository.save(invitation);
      }
    }

    const workspace =
      invitation.workspace ||
      (await this.workspaceRepository.findOne({
        where: { id: invitation.workspaceId },
      }));

    if (!workspace) {
      throw new NotFoundException('Рабочее пространство не найдено');
    }

    return {
      status: invitation.status,
      email: invitation.email,
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(currentUser: User, token: string) {
    const trimmedToken = token?.trim();
    if (!trimmedToken) {
      throw new BadRequestException('Некорректный токен приглашения');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { token: trimmedToken },
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено или уже использовано');
    }

    const currentUserEmail = currentUser.email.trim().toLowerCase();
    const expectedEmail = invitation.email.trim().toLowerCase();

    if (currentUserEmail !== expectedEmail) {
      throw new ForbiddenException(`Войдите как ${expectedEmail}`);
    }

    if (
      invitation.status === WorkspaceInvitationStatus.PENDING &&
      invitation.expiresAt &&
      invitation.expiresAt.getTime() < Date.now()
    ) {
      invitation.status = WorkspaceInvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Срок действия приглашения истёк');
    }

    if (invitation.status === WorkspaceInvitationStatus.CANCELLED) {
      throw new BadRequestException('Приглашение было отозвано');
    }

    if (
      ![WorkspaceInvitationStatus.PENDING, WorkspaceInvitationStatus.ACCEPTED].includes(invitation.status)
    ) {
      throw new BadRequestException('Приглашение недоступно');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: invitation.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Рабочее пространство не найдено');
    }

    const existingMembership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: workspace.id, userId: currentUser.id },
    });

    if (!existingMembership) {
      await this.workspaceMemberRepository.save({
        workspaceId: workspace.id,
        userId: currentUser.id,
        role: invitation.role,
        permissions: invitation.role === WorkspaceRole.MEMBER ? invitation.permissions : null,
        invitedById: invitation.invitedById,
      });
    }

    await this.userRepository.update(currentUser.id, { workspaceId: workspace.id });

    if (invitation.status === WorkspaceInvitationStatus.PENDING) {
      invitation.status = WorkspaceInvitationStatus.ACCEPTED;
      invitation.acceptedAt = new Date();
      await this.invitationRepository.save(invitation);
    }

    return {
      message: 'Приглашение принято. Теперь вы участник рабочего пространства.',
      workspaceId: workspace.id,
    };
  }

  private async sendInvitationEmail(params: {
    email: string;
    workspaceName: string;
    invitationLink: string;
    invitedBy?: string | null;
    role?: WorkspaceRole | null;
  }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (!resendApiKey || !resendFrom) {
      console.warn(
        `[Workspaces] Resend не настроен (нужны RESEND_API_KEY и RESEND_FROM), ссылка приглашения для ${params.email}: ${params.invitationLink}`,
      );
      return;
    }

    const roleLabels: Record<string, string> = {
      owner: 'Владелец',
      admin: 'Администратор',
      member: 'Участник',
    };

    const emailReact = React.createElement(WorkspaceInvitationEmail, {
      workspaceName: params.workspaceName,
      invitationLink: params.invitationLink,
      invitedBy: params.invitedBy,
      roleLabel: params.role ? roleLabels[params.role] || params.role : null,
    });

    const resend = new Resend(resendApiKey);

    try {
      const html = await render(emailReact);
      const timeoutMs = Number.parseInt(process.env.RESEND_TIMEOUT_MS || '10000', 10);

      const { error } = await retry(
        () =>
          withTimeout(
            resend.emails.send({
              from: resendFrom,
              to: params.email,
              subject: `Приглашение в рабочее пространство ${params.workspaceName}`,
              html,
              text: workspaceInvitationEmailText({
                workspaceName: params.workspaceName,
                invitationLink: params.invitationLink,
                invitedBy: params.invitedBy,
                roleLabel: params.role ? roleLabels[params.role] || params.role : null,
              }),
              replyTo: process.env.RESEND_REPLY_TO || undefined,
            }),
            Number.isFinite(timeoutMs) ? timeoutMs : 10000,
            'Resend request timed out',
          ),
        {
          retries: 1,
          baseDelayMs: 300,
          maxDelayMs: 2000,
          isRetryable: (err) => err instanceof TimeoutError,
        },
      );

      if (error) {
        console.warn('[Workspaces] Не удалось отправить email приглашения через Resend:', error.message);
      }
    } catch (error) {
      console.warn(
        '[Workspaces] Не удалось отправить email приглашения через Resend:',
        (error as Error)?.message,
      );
    }
  }
}
