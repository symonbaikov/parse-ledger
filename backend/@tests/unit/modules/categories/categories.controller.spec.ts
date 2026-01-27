import { CategoryType } from '@/entities/category.entity';
import { CategoriesController } from '@/modules/categories/categories.controller';

describe('CategoriesController', () => {
  it('proxies calls to CategoriesService', async () => {
    const categoriesService = {
      create: jest.fn(async () => ({ id: 'c1' })),
      findAll: jest.fn(async () => [{ id: 'c1' }]),
      findOne: jest.fn(async () => ({ id: 'c1' })),
      update: jest.fn(async () => ({ id: 'c1', name: 'X' })),
      remove: jest.fn(async () => undefined),
    };
    const controller = new CategoriesController(categoriesService as any);
    const user = { id: 'u1' } as any;

    expect(await controller.create({ name: 'A', type: CategoryType.EXPENSE } as any, user)).toEqual(
      { id: 'c1' },
    );
    expect(await controller.findAll(user, CategoryType.EXPENSE)).toEqual([{ id: 'c1' }]);
    expect(await controller.findOne('c1', user)).toEqual({ id: 'c1' });
    expect(await controller.update('c1', { name: 'X' } as any, user)).toEqual({
      id: 'c1',
      name: 'X',
    });
    expect(await controller.remove('c1', user)).toEqual({
      message: 'Category deleted successfully',
    });
  });
});
