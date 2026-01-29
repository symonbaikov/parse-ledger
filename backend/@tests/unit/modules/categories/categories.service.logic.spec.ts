import {
  type Category,
  CategoryType,
  type User,
  type WorkspaceMember,
  WorkspaceRole,
} from '@/entities';
import { CategoriesService } from '@/modules/categories/categories.service';
import { AuditService } from '@/modules/audit/audit.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

function createRepoMock<T>() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (data: Partial<T>) => data as T),
    remove: jest.fn(async () => undefined),
    createQueryBuilder: jest.fn(),
  } as unknown as Repository<T> & Record<string, any>;
}

describe('CategoriesService', () => {
  const categoryRepository = createRepoMock<Category>();
  const userRepository = createRepoMock<User>();
  const workspaceMemberRepository = createRepoMock<WorkspaceMember>();
  const cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  const auditService = { createEvent: jest.fn() } as unknown as AuditService;

  let service: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(
      categoryRepository as any,
      userRepository as any,
      workspaceMemberRepository as any,
      cacheManager as any,
      auditService as any,
    );
  });

  it('create throws ConflictException for duplicate name', async () => {
    userRepository.findOne = jest.fn(async () => ({
      id: 'u1',
      workspaceId: null,
    }));
    categoryRepository.findOne = jest.fn(async () => ({ id: 'c1' }) as any);

    await expect(
      service.create('u1', { name: 'Food', type: CategoryType.EXPENSE } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('update forbids changes to system categories', async () => {
    userRepository.findOne = jest.fn(async () => ({
      id: 'u1',
      workspaceId: null,
    }));
    categoryRepository.findOne = jest.fn(
      async () => ({ id: 'c1', userId: 'u1', isSystem: true }) as any,
    );

    await expect(service.update('c1', 'u1', { name: 'X' } as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('update throws ConflictException when changing name to existing one', async () => {
    userRepository.findOne = jest.fn(async () => ({
      id: 'u1',
      workspaceId: null,
    }));
    categoryRepository.findOne = jest
      .fn()
      .mockResolvedValueOnce({
        id: 'c1',
        userId: 'u1',
        name: 'Old',
        type: CategoryType.EXPENSE,
        isSystem: false,
      } as any)
      .mockResolvedValueOnce({
        id: 'c2',
        userId: 'u1',
        name: 'New',
        type: CategoryType.EXPENSE,
      } as any);

    await expect(service.update('c1', 'u1', { name: 'New' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('remove throws NotFoundException when category does not exist', async () => {
    userRepository.findOne = jest.fn(async () => ({
      id: 'u1',
      workspaceId: null,
    }));
    categoryRepository.findOne = jest.fn(async () => null);

    await expect(service.remove('missing', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('createSystemCategories skips existing entries', async () => {
    categoryRepository.findOne = jest.fn(async ({ where }: any) =>
      where?.name === 'Приход' ? ({ id: 'exists' } as any) : null,
    );

    await service.createSystemCategories('u1');

    expect(categoryRepository.save).toHaveBeenCalled();
    expect(categoryRepository.save).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Приход' }),
    );
  });

  it('denies create when member has canEditCategories=false', async () => {
    userRepository.findOne = jest.fn(async () => ({
      id: 'u1',
      workspaceId: 'w1',
    }));
    workspaceMemberRepository.findOne = jest.fn(async () => ({
      role: WorkspaceRole.MEMBER,
      permissions: { canEditCategories: false },
    }));

    await expect(
      service.create('u1', { name: 'Food', type: CategoryType.EXPENSE } as any),
    ).rejects.toThrow(ForbiddenException);
  });
});
