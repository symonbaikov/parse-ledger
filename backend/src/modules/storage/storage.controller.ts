import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { UpdateSharedLinkDto } from './dto/update-shared-link.dto';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AccessSharedLinkDto } from './dto/access-shared-link.dto';
import { UpdateFileCategoryDto } from './dto/update-file-category.dto';
import * as fs from 'fs';

/**
 * Storage controller for file management, sharing, and permissions
 */
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Get all files in storage for current user
   * GET /api/v1/storage/files
   */
  @Get('files')
  async getStorageFiles(@CurrentUser() user: any) {
    return await this.storageService.getStorageFiles(user.id);
  }

  /**
   * Get file details with transactions
   * GET /api/v1/storage/files/:id
   */
  @Get('files/:id')
  async getFileDetails(@Param('id') statementId: string, @CurrentUser() user: any) {
    return await this.storageService.getFileDetails(statementId, user.id);
  }

  /**
   * Update category for a file
   * PATCH /api/v1/storage/files/:id/category
   */
  @Patch('files/:id/category')
  async updateFileCategory(
    @Param('id') statementId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateFileCategoryDto,
  ) {
    return await this.storageService.updateFileCategory(
      statementId,
      user.id,
      dto.categoryId ?? null,
    );
  }

  /**
   * Preview file inline
   * GET /api/v1/storage/files/:id/view
   */
  @Get('files/:id/view')
  async viewFile(
    @Param('id') statementId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } = await this.storageService.getFilePreview(
      statementId,
      user.id,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);

    return res.sendFile(filePath);
  }

  /**
   * Download file
   * GET /api/v1/storage/files/:id/download
   */
  @Get('files/:id/download')
  async downloadFile(
    @Param('id') statementId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } = await this.storageService.downloadFile(
      statementId,
      user.id,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * Create shared link for a file
   * POST /api/v1/storage/files/:id/share
   */
  @Post('files/:id/share')
  async createSharedLink(
    @Param('id') statementId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateSharedLinkDto,
  ) {
    const link = await this.storageService.createSharedLink(statementId, user.id, dto);

    // Generate full URL for the shared link
    const shareUrl = `${process.env.FRONTEND_URL}/shared/${link.token}`;

    return {
      ...link,
      shareUrl,
      // Don't expose password hash
      password: link.password ? '******' : null,
    };
  }

  /**
   * Get shared links for a file
   * GET /api/v1/storage/files/:id/shares
   */
  @Get('files/:id/shares')
  async getSharedLinks(@Param('id') statementId: string, @CurrentUser() user: any) {
    return await this.storageService.getSharedLinks(statementId, user.id);
  }

  /**
   * Update shared link
   * PUT /api/v1/storage/shares/:id
   */
  @Put('shares/:id')
  async updateSharedLink(
    @Param('id') linkId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateSharedLinkDto,
  ) {
    return await this.storageService.updateSharedLink(linkId, user.id, dto);
  }

  /**
   * Delete shared link
   * DELETE /api/v1/storage/shares/:id
   */
  @Delete('shares/:id')
  async deleteSharedLink(@Param('id') linkId: string, @CurrentUser() user: any) {
    await this.storageService.deleteSharedLink(linkId, user.id);
    return { message: 'Shared link deleted successfully' };
  }

  /**
   * Access shared link (public endpoint)
   * GET /api/v1/storage/shared/:token
   */
  @Public()
  @Get('shared/:token')
  async accessSharedLink(@Param('token') token: string, @Query() query: AccessSharedLinkDto) {
    return await this.storageService.accessSharedLink(token, query.password);
  }

  /**
   * Download file via shared link (public endpoint)
   * GET /api/v1/storage/shared/:token/download
   */
  @Public()
  @Get('shared/:token/download')
  async downloadSharedFile(
    @Param('token') token: string,
    @Query() query: AccessSharedLinkDto,
    @Res() res: Response,
  ) {
    const { statement, canDownload } = await this.storageService.accessSharedLink(
      token,
      query.password,
    );

    if (!canDownload) {
      res.status(HttpStatus.FORBIDDEN).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to download this file',
        },
      });
      return;
    }

    const filePath = statement.filePath;
    const fileName = statement.fileName;
    const mimeType = this.getMimeType(statement.fileType);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * Grant permission to user
   * POST /api/v1/storage/files/:id/permissions
   */
  @Post('files/:id/permissions')
  async grantPermission(
    @Param('id') statementId: string,
    @CurrentUser() user: any,
    @Body() dto: GrantPermissionDto,
  ) {
    return await this.storageService.grantPermission(statementId, user.id, dto);
  }

  /**
   * Get permissions for a file
   * GET /api/v1/storage/files/:id/permissions
   */
  @Get('files/:id/permissions')
  async getFilePermissions(@Param('id') statementId: string, @CurrentUser() user: any) {
    return await this.storageService.getFilePermissions(statementId, user.id);
  }

  /**
   * Update permission
   * PUT /api/v1/storage/permissions/:id
   */
  @Put('permissions/:id')
  async updatePermission(
    @Param('id') permissionId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePermissionDto,
  ) {
    return await this.storageService.updatePermission(permissionId, user.id, dto);
  }

  /**
   * Revoke permission
   * DELETE /api/v1/storage/permissions/:id
   */
  @Delete('permissions/:id')
  async revokePermission(@Param('id') permissionId: string, @CurrentUser() user: any) {
    await this.storageService.revokePermission(permissionId, user.id);
    return { message: 'Permission revoked successfully' };
  }

  /**
   * Helper to get MIME type
   */
  private getMimeType(fileType: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }
}
