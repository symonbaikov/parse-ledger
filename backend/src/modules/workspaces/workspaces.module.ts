import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import {
  User,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, WorkspaceInvitation, User]),
  ],
  providers: [WorkspacesService],
  controllers: [WorkspacesController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
