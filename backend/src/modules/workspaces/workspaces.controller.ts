import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Public } from '../auth/decorators/public.decorator';

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
  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.workspacesService.acceptInvitation(dto);
  }
}
