import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BankProfile, BankProfileService } from '../services/bank-profile.service';
import { ProfileConfigService, UpdateConfigDto } from '../services/profile-config.service';

type CreateProfileDto = Pick<BankProfile, 'id' | 'name' | 'country' | 'currency'> &
  Partial<BankProfile>;
type UpdateProfileDto = Partial<CreateProfileDto>;
type SetActiveProfileDto = { profileId: string };
type BackupDto = { profileId?: string };

@Controller('profiles')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly profileConfigService: ProfileConfigService,
    private readonly bankProfileService: BankProfileService,
  ) {}

  @Get()
  getProfiles() {
    const profiles = this.bankProfileService.getAllProfiles();
    return { status: 'success', data: { profiles, total: profiles.length } };
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    const profile = this.bankProfileService.getProfile(id);
    if (!profile) {
      throw new HttpException(`Profile not found: ${id}`, HttpStatus.NOT_FOUND);
    }
    return { status: 'success', data: { profile } };
  }

  @Post()
  createProfile(@Body() body: CreateProfileDto) {
    try {
      const result = this.profileConfigService.saveProfileToFile(body as BankProfile);
      if (!result.success || !result.profile) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      return {
        status: 'success',
        message: result.message,
        data: result.profile,
      };
    } catch (error) {
      this.logger.error('Failed to create profile', error as Error);
      throw new HttpException('Failed to create profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  updateProfile(@Param('id') id: string, @Body() body: UpdateProfileDto) {
    const existing = this.bankProfileService.getProfile(id);
    if (!existing) {
      throw new HttpException(`Profile not found: ${id}`, HttpStatus.NOT_FOUND);
    }

    const updated: BankProfile = { ...existing, ...body, id };
    const result = this.profileConfigService.saveProfileToFile(updated);

    if (!result.success || !result.profile) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    return {
      status: 'success',
      message: 'Profile updated',
      data: result.profile,
    };
  }

  @Delete(':id')
  deleteProfile(@Param('id') id: string) {
    const result = this.profileConfigService.deleteProfileFile(id);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return { status: 'success', message: result.message };
  }

  @Post('set-active')
  setActiveProfile(@Body() body: SetActiveProfileDto) {
    const result = this.profileConfigService.setActiveProfile(body);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return { status: 'success', message: result.message };
  }

  @Get('active')
  getActiveProfile() {
    return {
      status: 'success',
      data: this.profileConfigService.getActiveProfile(),
    };
  }

  @Post('backup')
  createBackup(@Body() body: BackupDto) {
    const result = this.profileConfigService.createBackup(body);
    return {
      status: result.success ? 'success' : 'error',
      message: result.message,
      data: result,
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'success',
      data: this.profileConfigService.getConfigHealth(),
    };
  }

  @Get('schema')
  getSchema() {
    return {
      status: 'success',
      data: this.profileConfigService.getCurrentSchema(),
    };
  }

  @Get('diagnostics')
  getDiagnostics() {
    return {
      status: 'success',
      data: this.profileConfigService.getDiagnostics(),
    };
  }

  @Put('config')
  updateConfig(@Body() config: UpdateConfigDto) {
    const updated = this.profileConfigService.updateHotReloadConfig(config);
    return {
      status: 'success',
      message: 'Configuration updated',
      data: updated,
    };
  }
}
