import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserRole,
  Workspace,
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
  WorkspaceMember,
  WorkspaceRole,
} from '../../entities';
import { ROLE_PERMISSIONS } from '../../common/enums/permissions.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceInvitation)
    private workspaceInvitationRepository: Repository<WorkspaceInvitation>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const normalizedEmail = registerDto.email.trim().toLowerCase();
    const invitationToken = registerDto.invitationToken?.trim() || null;

    if (invitationToken) {
      const invitation = await this.workspaceInvitationRepository.findOne({
        where: { token: invitationToken },
      });

      if (!invitation) {
        throw new BadRequestException('Invitation not found or already used');
      }

      if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
        throw new BadRequestException('Invitation is not pending');
      }

      if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
        invitation.status = WorkspaceInvitationStatus.EXPIRED;
        await this.workspaceInvitationRepository.save(invitation);
        throw new BadRequestException('Invitation has expired');
      }

      const invitationEmail = invitation.email.trim().toLowerCase();
      if (invitationEmail !== normalizedEmail) {
        throw new BadRequestException('Email does not match invitation');
      }
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: normalizedEmail,
      passwordHash,
      name: registerDto.name,
      company: registerDto.company || null,
      role: UserRole.USER,
      isActive: true,
      permissions: null, // Use role-based permissions by default
    });

    const savedUser = await this.userRepository.save(user);

    if (invitationToken) {
      return this.generateTokens(savedUser);
    }

    const workspaceName = registerDto.company?.trim()
      ? `${registerDto.company.trim()} workspace`
      : `${registerDto.name || registerDto.email} workspace`;

    const workspace = this.workspaceRepository.create({
      name: workspaceName,
      ownerId: savedUser.id,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    savedUser.workspaceId = savedWorkspace.id;
    await this.userRepository.save(savedUser);

    await this.workspaceMemberRepository.save({
      workspaceId: savedWorkspace.id,
      userId: savedUser.id,
      role: WorkspaceRole.OWNER,
      invitedById: savedUser.id,
    });

    return this.generateTokens(savedUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const tokenVersion = payload.tokenVersion ?? 0;
      if ((user.tokenVersion ?? 0) !== tokenVersion) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const accessTokenPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0,
      };

      const access_token = this.jwtService.sign(accessTokenPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      } as any);

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // In a more advanced implementation, you would store refresh tokens
    // in a database and revoke them here
    // For now, we'll just return success
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.userRepository.increment({ id: userId }, 'tokenVersion', 1);
    return { message: 'Logged out from all devices successfully' };
  }

  private generateTokens(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      type: 'refresh',
      tokenVersion: user.tokenVersion ?? 0,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    } as any);

    const refresh_token = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    } as any);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId || null,
        locale: user.locale,
        timeZone: user.timeZone ?? null,
      },
      access_token,
      refresh_token,
    };
  }
}
