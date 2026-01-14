import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { DataEntryType } from '../../entities/data-entry.entity';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataEntryService } from './data-entry.service';
import { CreateDataEntryCustomFieldDto } from './dto/create-data-entry-custom-field.dto';
import { CreateDataEntryDto } from './dto/create-data-entry.dto';
import { UpdateDataEntryCustomFieldDto } from './dto/update-data-entry-custom-field.dto';

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
    @Query('customTabId') customTabId?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('q') query?: string,
    @Query('date') date?: string,
  ) {
    const safeLimit = Math.min(Math.max(limit || 50, 1), 200);
    const safePage = Math.max(page || 1, 1);
    const { items, total } = await this.dataEntryService.list({
      userId: user.id,
      type,
      customTabId,
      limit: safeLimit,
      page: safePage,
      query,
      date,
    });
    return { items, total, page: safePage, limit: safeLimit };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.dataEntryService.remove(user.id, id);
    return { ok: true };
  }

  @Get('custom-fields')
  async listCustomFields(@CurrentUser() user: User) {
    const items = await this.dataEntryService.listCustomFields(user.id);
    return { items };
  }

  @Post('custom-fields')
  async createCustomField(@CurrentUser() user: User, @Body() dto: CreateDataEntryCustomFieldDto) {
    return this.dataEntryService.createCustomField(user.id, dto);
  }

  @Post('custom-fields/icon')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
          const targetDir = path.join(uploadsDir, 'custom-field-icons');
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          cb(null, targetDir);
        },
        filename: (req, file, cb) => {
          const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
          cb(null, safeName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only images allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 1_500_000 },
    }),
  )
  async uploadCustomIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }
    const url = `/uploads/custom-field-icons/${file.filename}`;
    return { url };
  }

  @Patch('custom-fields/:id')
  async updateCustomField(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateDataEntryCustomFieldDto,
  ) {
    return this.dataEntryService.updateCustomField(user.id, id, dto);
  }

  @Delete('custom-fields/:id')
  async removeCustomField(@CurrentUser() user: User, @Param('id') id: string) {
    await this.dataEntryService.removeCustomField(user.id, id);
    return { ok: true };
  }
}
