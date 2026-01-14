import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletsService } from './wallets.service';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.WALLET_CREATE)
  async create(@Body() createDto: CreateWalletDto, @CurrentUser() user: User) {
    return this.walletsService.create(user.id, createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.WALLET_VIEW)
  async findAll(@CurrentUser() user: User) {
    return this.walletsService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.WALLET_VIEW)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.walletsService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.WALLET_EDIT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWalletDto,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.WALLET_DELETE)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.walletsService.remove(id, user.id);
    return { message: 'Wallet deleted successfully' };
  }
}
