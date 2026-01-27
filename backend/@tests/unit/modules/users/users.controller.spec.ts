import { UserRole } from '@/entities/user.entity';
import { UsersController } from '@/modules/users/users.controller';

describe('UsersController', () => {
  it('findOne returns own profile for non-admin requesting other user', async () => {
    const usersService = {
      findAll: jest.fn(),
      getProfile: jest.fn(async (id: string) => ({
        id,
        role: UserRole.USER,
        passwordHash: 'x',
      })),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeEmail: jest.fn(),
      changePassword: jest.fn(),
      updateMyPreferences: jest.fn(),
    };
    const permissionsService = {
      getUserPermissions: jest.fn(),
      updateUserPermissions: jest.fn(),
      addPermission: jest.fn(),
      removePermission: jest.fn(),
      resetPermissions: jest.fn(),
    };
    const controller = new UsersController(usersService as any, permissionsService as any);

    const result = await controller.findOne('other', {
      id: 'me',
      role: UserRole.USER,
    } as any);
    expect(result.id).toBe('me');
    expect(usersService.findOne).not.toHaveBeenCalled();
    expect(usersService.getProfile).toHaveBeenCalledWith('me');
  });

  it('changeEmail strips passwordHash from response', async () => {
    const usersService = {
      findAll: jest.fn(),
      getProfile: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeEmail: jest.fn(async () => ({
        id: 'u1',
        email: 'x',
        passwordHash: 'secret',
      })),
      changePassword: jest.fn(),
      updateMyPreferences: jest.fn(),
    };
    const permissionsService = {} as any;
    const controller = new UsersController(usersService as any, permissionsService);

    const result = await controller.changeEmail({ id: 'u1' } as any, { email: 'x' } as any);
    expect(result.user).toEqual({ id: 'u1', email: 'x' });
  });
});
