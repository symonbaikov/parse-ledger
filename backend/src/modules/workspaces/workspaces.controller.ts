import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { User } from '../../entities';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  private getRequestAppOrigin(req: Request): string | undefined {
    const originHeader = req.headers.origin;
    if (typeof originHeader === 'string' && originHeader.trim().length > 0) {
      return originHeader;
    }

    const refererHeader = req.headers.referer;
    if (typeof refererHeader === 'string' && refererHeader.trim().length > 0) {
      try {
        return new URL(refererHeader).origin;
      } catch {
        // ignore
      }
    }

    const forwardedHost = req.headers['x-forwarded-host'];
    const host =
      (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.headers.host;
    if (typeof host === 'string' && host.trim().length > 0) {
      const forwardedProto = req.headers['x-forwarded-proto'];
      const protoRaw = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
      const proto = typeof protoRaw === 'string' && protoRaw.length > 0 ? protoRaw : 'https';
      return `${proto}://${host}`;
    }

    return undefined;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyWorkspace(@CurrentUser() user: User, @Req() req: Request) {
    return this.workspacesService.getWorkspaceOverview(user, this.getRequestAppOrigin(req));
  }

  @Post('invitations')
  @UseGuards(JwtAuthGuard)
  async inviteMember(@CurrentUser() user: User, @Body() dto: InviteMemberDto, @Req() req: Request) {
    return this.workspacesService.inviteMember(user, dto, this.getRequestAppOrigin(req));
  }

  @Delete('members/:userId')
  @UseGuards(JwtAuthGuard)
  async removeMember(@CurrentUser() user: User, @Param('userId') userId: string) {
    return this.workspacesService.removeMember(user, userId);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 per minute
  @Get('invitations/:token')
  async getInvitation(@Param('token') token: string) {
    return this.workspacesService.getInvitationInfo(token);
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@CurrentUser() user: User, @Param('token') token: string) {
    return this.workspacesService.acceptInvitation(user, token);
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptInvitationLegacy(@CurrentUser() user: User, @Body() dto: AcceptInvitationDto) {
    return this.workspacesService.acceptInvitation(user, dto.token);
  }
}
