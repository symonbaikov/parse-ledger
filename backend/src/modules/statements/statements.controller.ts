import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Headers,
  HttpCode,
  HttpStatus,
  Res,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StatementsService } from './statements.service';
import { UploadStatementDto } from './dto/upload-statement.dto';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { validateFile } from '../../common/utils/file-validator.util';
import { multerConfig } from '../../config/multer.config';

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
  ) {
    return this.statementsService.findAll(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  // File routes must be defined before :id route to avoid conflicts
  @Get(':id/file')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async getFile(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    const filePath = await this.statementsService.getFilePath(id, user.id);
    return res.download(filePath);
  }

  @Get(':id/view')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_VIEW)
  async viewFile(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    const { stream, fileName, mimeType } = await this.statementsService.getFileStream(
      id,
      user.id,
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    stream.pipe(res);
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
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.statementsService.remove(id, user.id);
  }

  @Post(':id/reprocess')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.STATEMENT_EDIT)
  async reprocess(@Param('id') id: string, @CurrentUser() user: User) {
    return this.statementsService.reprocess(id, user.id);
  }
}
