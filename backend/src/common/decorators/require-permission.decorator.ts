import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../enums/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
