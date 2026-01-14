import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import type { CategoryType } from '../../entities/category.entity';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CategoriesService } from './categories.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.CATEGORY_CREATE)
  async create(@Body() createDto: CreateCategoryDto, @CurrentUser() user: User) {
    return this.categoriesService.create(user.id, createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.CATEGORY_VIEW)
  async findAll(@CurrentUser() user: User, @Query('type') type?: CategoryType) {
    return this.categoriesService.findAll(user.id, type);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.CATEGORY_VIEW)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.categoriesService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.CATEGORY_EDIT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.CATEGORY_DELETE)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.categoriesService.remove(id, user.id);
    return { message: 'Category deleted successfully' };
  }
}
