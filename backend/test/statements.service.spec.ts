import { StatementsService } from '../src/modules/statements/statements.service';
import { calculateFileHash } from '../src/common/utils/file-hash.util';

jest.mock('../src/common/utils/file-hash.util', () => ({
  calculateFileHash: jest.fn(),
}));

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
      {} as any,
    );

    await service.findAll('user-1', 1, 20);

    expect(qb.where).toHaveBeenCalledWith('owner.workspaceId = :workspaceId', {
      workspaceId: 'ws-1',
    });
  });

  it('creates a new statement even when file hash is duplicated', async () => {
    (calculateFileHash as jest.Mock).mockResolvedValue('same-hash');

    const statementRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder()),
      create: jest.fn((data) => data),
      save: jest
        .fn()
        .mockImplementationOnce(async (entity) => ({ ...entity, id: 'stmt-1' }))
        .mockImplementationOnce(async (entity) => ({ ...entity, id: 'stmt-2' })),
      findOne: jest.fn(),
    };

    const auditLogRepository = { save: jest.fn().mockResolvedValue(undefined) };
    const userRepository = { findOne: jest.fn().mockResolvedValue({ id: 'user-1', workspaceId: null }) };
    const statementProcessingService = { processStatement: jest.fn().mockResolvedValue(undefined) };

    const service = new StatementsService(
      statementRepository as any,
      {} as any,
      auditLogRepository as any,
      userRepository as any,
      {} as any,
      {} as any,
      statementProcessingService as any,
    );

    const file = {
      path: '/tmp/file-1.pdf',
      originalname: 'file.pdf',
      mimetype: 'application/pdf',
      size: 123,
    } as any;

    const first = await service.create({ id: 'user-1' } as any, file);
    const second = await service.create({ id: 'user-1' } as any, file);

    expect(first.id).toBe('stmt-1');
    expect(second.id).toBe('stmt-2');
    expect(first.fileHash).toBe('same-hash');
    expect(second.fileHash).toBe('same-hash');
    expect(statementProcessingService.processStatement).toHaveBeenCalledWith('stmt-1');
    expect(statementProcessingService.processStatement).toHaveBeenCalledWith('stmt-2');
    expect(statementRepository.save).toHaveBeenCalledTimes(2);
  });
});
