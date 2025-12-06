import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.BRANCH_CREATE)
  async create(@Body() createDto: CreateBranchDto, @CurrentUser() user: User) {
    return this.branchesService.create(user.id, createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.BRANCH_VIEW)
  async findAll(@CurrentUser() user: User) {
    return this.branchesService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.BRANCH_VIEW)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.branchesService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.BRANCH_EDIT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ) {
    return this.branchesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.BRANCH_DELETE)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.branchesService.remove(id, user.id);
    return { message: 'Branch deleted successfully' };
  }
}


