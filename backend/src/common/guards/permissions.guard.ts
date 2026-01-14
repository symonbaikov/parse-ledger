import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { type User, UserRole } from '../../entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import type { Permission } from '../enums/permissions.enum';
import { ROLE_PERMISSIONS } from '../enums/permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Get user permissions (custom or role-based)
    const userPermissions = this.getUserPermissions(user);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private getUserPermissions(user: User): Permission[] {
    // If user has custom permissions, use them
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions as Permission[];
    }

    // Otherwise, use role-based permissions
    return ROLE_PERMISSIONS[user.role] || [];
  }
}
