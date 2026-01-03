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
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import {
  User,
  UserRole,
  Workspace,
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
  WorkspaceMember,
  WorkspaceRole,
} from '../../entities';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

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
        joinedAt: member.createdAt,
      })),
      invitations: invitations.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
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
      existingInvitation.invitedById = currentUser.id;
      existingInvitation.token = uuidv4();
      const updated = await this.invitationRepository.save(existingInvitation);
      const invitationLink = this.buildInvitationLink(updated.token);
      await this.sendInvitationEmail(email, workspace.name, invitationLink);
      return { invitation: updated, invitationLink };
    }

    const invitation = this.invitationRepository.create({
      workspaceId: workspace.id,
      email,
      role,
      token: uuidv4(),
      status: WorkspaceInvitationStatus.PENDING,
      invitedById: currentUser.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    });

    const savedInvitation = await this.invitationRepository.save(invitation);
    const invitationLink = this.buildInvitationLink(savedInvitation.token);
    await this.sendInvitationEmail(email, workspace.name, invitationLink);

    return { invitation: savedInvitation, invitationLink };
  }

  private buildInvitationLink(token: string) {
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/invite/${token}`;
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.invitationRepository.findOne({
      where: { token: dto.token },
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено или уже использовано');
    }

    if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
      throw new BadRequestException('Приглашение уже обработано');
    }

    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      invitation.status = WorkspaceInvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Срок действия приглашения истёк');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: invitation.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Рабочее пространство не найдено');
    }

    const normalizedEmail = invitation.email.toLowerCase();
    let user = await this.userRepository.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      if (!dto.password || !dto.name) {
        throw new BadRequestException('Для создания учётной записи нужны имя и пароль');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      user = this.userRepository.create({
        email: normalizedEmail,
        name: dto.name,
        passwordHash,
        company: null,
        role: UserRole.USER,
        isActive: true,
        workspaceId: workspace.id,
      });
      user = await this.userRepository.save(user);
    } else {
      await this.userRepository.update(user.id, { workspaceId: workspace.id });
    }

    const existingMembership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });

    if (!existingMembership) {
      await this.workspaceMemberRepository.save({
        workspaceId: workspace.id,
        userId: user.id,
        role: invitation.role,
        invitedById: invitation.invitedById,
      });
    }

    invitation.status = WorkspaceInvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitationRepository.save(invitation);

    return {
      message: 'Приглашение принято. Теперь вы участник рабочего пространства.',
      workspaceId: workspace.id,
    };
  }

  private async sendInvitationEmail(email: string, workspaceName: string, link: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        `[Workspaces] SMTP не настроен, ссылка приглашения для ${email}: ${link}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@finflow',
        to: email,
        subject: `Приглашение в рабочее пространство ${workspaceName}`,
        html: `
          <p>Вы приглашены в рабочее пространство <strong>${workspaceName}</strong>.</p>
          <p>Чтобы присоединиться, перейдите по ссылке: <a href="${link}">${link}</a></p>
          <p>Ссылка действует 7 дней.</p>
        `,
      });
    } catch (error) {
      console.warn('[Workspaces] Не удалось отправить email приглашения:', (error as Error)?.message);
    }
  }
}
