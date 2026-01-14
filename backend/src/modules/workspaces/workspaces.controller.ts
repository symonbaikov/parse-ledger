import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyWorkspace(@CurrentUser() user: User) {
    return this.workspacesService.getWorkspaceOverview(user);
  }

  @Post('invitations')
  @UseGuards(JwtAuthGuard)
  async inviteMember(@CurrentUser() user: User, @Body() dto: InviteMemberDto) {
    return this.workspacesService.inviteMember(user, dto);
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
