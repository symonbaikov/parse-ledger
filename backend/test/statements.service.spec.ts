import { StatementsService } from '../src/modules/statements/statements.service';

describe('StatementsService', () => {
  const makeQueryBuilder = () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    return qb;
  };

  it('orders by createdAt when listing statements', async () => {
    const qb = makeQueryBuilder();
    const statementRepository = {
      createQueryBuilder: jest.fn(() => qb),
    };

    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'user-1', workspaceId: null }),
    };

    const service = new StatementsService(
      statementRepository as any,
      {} as any,
      {} as any,
      userRepository as any,
      {} as any,
      {} as any,
    );

    await service.findAll('user-1', 1, 20);

    expect(qb.orderBy).toHaveBeenCalledWith('statement.createdAt', 'DESC');
    expect(qb.where).toHaveBeenCalledWith('statement.userId = :userId', { userId: 'user-1' });
  });

  it('filters by workspace when user is in workspace', async () => {
    const qb = makeQueryBuilder();
    const statementRepository = {
      createQueryBuilder: jest.fn(() => qb),
    };

    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'user-1', workspaceId: 'ws-1' }),
    };

    const service = new StatementsService(
      statementRepository as any,
      {} as any,
      {} as any,
      userRepository as any,
      {} as any,
      {} as any,
    );

    await service.findAll('user-1', 1, 20);

    expect(qb.where).toHaveBeenCalledWith('owner.workspaceId = :workspaceId', {
      workspaceId: 'ws-1',
    });
  });
});

