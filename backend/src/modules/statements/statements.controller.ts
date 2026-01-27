import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { validateFile } from '../../common/utils/file-validator.util';
import { buildContentDisposition } from '../../common/utils/http-file.util';
import { multerConfig } from '../../config/multer.config';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { UploadStatementDto } from './dto/upload-statement.dto';
import { StatementsService } from './statements.service';

@Controller('statements')
@UseGuards(JwtAuthGuard)
export class StatementsController {
  constructor(private readonly statementsService: StatementsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_UPLOAD)
  @UseInterceptors(FilesInterceptor('files', 2, multerConfig))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadStatementDto,
    @CurrentUser() user: User,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 2) {
      throw new Error('Maximum 2 files allowed');
    }

    // Validate each file
    files.forEach(validateFile);

    // Process each file
    const results = await Promise.all(
      files.map(file =>
        this.statementsService.create(
          user,
          file,
          uploadDto.googleSheetId || undefined,
          uploadDto.walletId || undefined,
          uploadDto.branchId || undefined,
          uploadDto.allowDuplicates ?? false,
        ),
      ),
    );

    return {
      data: results,
      idempotencyKey,
    };
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.statementsService.findAll(
      user.id,
      page ? Number.parseInt(page) : 1,
      limit ? Number.parseInt(limit) : 20,
      search,
    );
  }

  // File routes must be defined before :id route to avoid conflicts
  @Get(':id/file')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async getFile(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    const { stream, fileName, mimeType } = await this.statementsService.getFileStream(id, user.id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition('attachment', fileName));
    stream.on('error', (err: any) => {
      const status =
        err?.code === 'ENOENT' || err?.code === 'EISDIR'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;
      if (!res.headersSent) {
        res.status(status).json({
          error: {
            code: status === HttpStatus.NOT_FOUND ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message:
              status === HttpStatus.NOT_FOUND
                ? 'File not found on disk'
                : 'Failed to download file',
          },
        });
      } else {
        res.destroy(err);
      }
    });
    stream.pipe(res);
  }

  @Get(':id/view')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async viewFile(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    const { stream, fileName, mimeType } = await this.statementsService.getFileStream(id, user.id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition('inline', fileName));
    stream.on('error', (err: any) => {
      const status =
        err?.code === 'ENOENT' || err?.code === 'EISDIR'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;
      if (!res.headersSent) {
        res.status(status).json({
          error: {
            code: status === HttpStatus.NOT_FOUND ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message:
              status === HttpStatus.NOT_FOUND ? 'File not found on disk' : 'Failed to read file',
          },
        });
      } else {
        res.destroy(err);
      }
    });
    stream.pipe(res);
  }

  @Get(':id/thumbnail')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async getThumbnail(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    try {
      const thumbnail = await this.statementsService.getThumbnail(id, user.id);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.send(thumbnail);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Thumbnail not available',
        },
      });
    }
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_DELETE)
  async moveToTrash(@Param('id') id: string, @CurrentUser() user: User) {
    return this.statementsService.moveToTrash(id, user.id);
  }

  @Post(':id/restore')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_EDIT)
  async restoreFile(@Param('id') id: string, @CurrentUser() user: User) {
    return this.statementsService.restoreFile(id, user.id);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.statementsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_EDIT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStatementDto,
    @CurrentUser() user: User,
  ) {
    return this.statementsService.updateMetadata(id, user.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Query('permanent') permanent?: string,
  ) {
    const isPermanent = permanent === 'true';
    if (isPermanent) {
      await this.statementsService.permanentDelete(id, user.id);
    } else {
      await this.statementsService.moveToTrash(id, user.id);
    }
  }

  @Post(':id/reprocess')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_EDIT)
  async reprocess(@Param('id') id: string, @CurrentUser() user: User) {
    return this.statementsService.reprocess(id, user.id);
  }
}
