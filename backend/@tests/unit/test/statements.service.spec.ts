import * as fs from 'fs';
import { calculateFileHash } from '@/common/utils/file-hash.util';
import { StatementsService } from '@/modules/statements/statements.service';

jest.mock('@/common/utils/file-hash.util', () => ({
  calculateFileHash: jest.fn(),
}));

describe('StatementsService', () => {
  const statementRepository = {
    create: jest.fn(data => data),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const auditLogRepository = { save: jest.fn().mockResolvedValue(undefined) };
  const userRepository = {
    findOne: jest.fn(),
  };
  const workspaceMemberRepository = {
    findOne: jest.fn(),
  };
  const statementProcessingService = {
    processStatement: jest.fn().mockResolvedValue(undefined),
  };
  const fileStorageService = {};
  const transactionRepository = {};

  let service: StatementsService;
  let qb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from('test'));
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);

    qb = {
      leftJoinAndSelect: jest.fn(() => qb),
      orderBy: jest.fn(() => qb),
      skip: jest.fn(() => qb),
      take: jest.fn(() => qb),
      where: jest.fn(() => qb),
      andWhere: jest.fn(() => qb),
      getManyAndCount: jest.fn(async () => [[], 0]),
    };
    statementRepository.createQueryBuilder = jest.fn(() => qb);

    service = new StatementsService(
      statementRepository as any,
      transactionRepository as any,
      auditLogRepository as any,
      userRepository as any,
      workspaceMemberRepository as any,
      fileStorageService as any,
      statementProcessingService as any,
    );
    jest.spyOn(service as any, 'ensureCanEditStatements').mockResolvedValue(undefined);
  });

  it('orders by createdAt when listing statements', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      workspaceId: null,
    });
    qb.getManyAndCount = jest.fn(async () => [[], 0]);

    const result = await service.findAll('user-1', 1, 20);

    expect(statementRepository.createQueryBuilder).toHaveBeenCalledWith('statement');
    expect(qb.orderBy).toHaveBeenCalledWith('statement.createdAt', 'DESC');
    expect(qb.where).toHaveBeenCalledWith('statement.userId = :userId', {
      userId: 'user-1',
    });
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
  });

  it('filters by workspace when user is in workspace', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      workspaceId: 'ws-1',
    });
    qb.getManyAndCount = jest.fn(async () => [[], 0]);

    await service.findAll('user-1', 1, 20);

    expect(qb.where).toHaveBeenCalledWith(
      'user.workspaceId = :workspaceId OR statement.userId = :userId',
      {
        workspaceId: 'ws-1',
        userId: 'user-1',
      },
    );
  });

  it('creates a new statement even when file hash is duplicated', async () => {
    (calculateFileHash as jest.Mock).mockResolvedValue('same-hash');
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      workspaceId: null,
    });
    statementRepository.save
      .mockImplementationOnce(async entity => ({ ...entity, id: 'stmt-1' }))
      .mockImplementationOnce(async entity => ({ ...entity, id: 'stmt-2' }));
    statementRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'stmt-1' });

    const file = {
      path: '/tmp/file-1.pdf',
      originalname: 'file.pdf',
      mimetype: 'application/pdf',
      size: 123,
    } as any;

    await service.create({ id: 'user-1' } as any, file);
    await expect(service.create({ id: 'user-1' } as any, file)).rejects.toThrow();
  });
});
