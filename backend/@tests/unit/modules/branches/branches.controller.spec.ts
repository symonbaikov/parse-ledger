import { BranchesController } from '@/modules/branches/branches.controller';

describe('BranchesController', () => {
  it('proxies calls to BranchesService', async () => {
    const branchesService = {
      create: jest.fn(async () => ({ id: 'b1' })),
      findAll: jest.fn(async () => [{ id: 'b1' }]),
      findOne: jest.fn(async () => ({ id: 'b1' })),
      update: jest.fn(async () => ({ id: 'b1', name: 'X' })),
      remove: jest.fn(async () => undefined),
    };
    const controller = new BranchesController(branchesService as any);
    const user = { id: 'u1' } as any;

    expect(await controller.create({ name: 'A' } as any, user)).toEqual({ id: 'b1' });
    expect(await controller.findAll(user)).toEqual([{ id: 'b1' }]);
    expect(await controller.findOne('b1', user)).toEqual({ id: 'b1' });
    expect(await controller.update('b1', { name: 'X' } as any, user)).toEqual({
      id: 'b1',
      name: 'X',
    });
    expect(await controller.remove('b1', user)).toEqual({ message: 'Branch deleted successfully' });
  });
});
