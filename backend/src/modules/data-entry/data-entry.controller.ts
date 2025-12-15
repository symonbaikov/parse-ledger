import { Body, Controller, Get, Post, Query, UseGuards, Delete, Param, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { DataEntryService } from './data-entry.service';
import { CreateDataEntryDto } from './dto/create-data-entry.dto';
import { DataEntryType } from '../../entities/data-entry.entity';

@Controller('data-entry')
@UseGuards(JwtAuthGuard)
export class DataEntryController {
  constructor(private readonly dataEntryService: DataEntryService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateDataEntryDto) {
    const entry = await this.dataEntryService.create(user.id, dto);
    return entry;
  }

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('type') type?: DataEntryType,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    const safeLimit = Math.min(Math.max(limit || 50, 1), 200);
    const items = await this.dataEntryService.list({
      userId: user.id,
      type,
      limit: safeLimit,
    });
    return { items };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.dataEntryService.remove(user.id, id);
    return { ok: true };
  }
}
