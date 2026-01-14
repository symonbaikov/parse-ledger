import { StatementsService } from '@/modules/statements/statements.service';
import { calculateFileHash } from '@/common/utils/file-hash.util';
import * as fs from 'fs';

jest.mock('@/common/utils/file-hash.util', () => ({
  calculateFileHash: jest.fn(),
}));

describe('StatementsService', () => {
  const statementRepository = {
    create: jest.fn((data) => data),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const auditLogRepository = { save: jest.fn().mockResolvedValue(undefined) };
  const userRepository = {
    findOne: jest.fn(),
  };
  const workspaceMemberRepository = {
    findOne: jest.fn(),
  };
  const statementProcessingService = { processStatement: jest.fn().mockResolvedValue(undefined) };
  const fileStorageService = {};
  const transactionRepository = {};

  let service: StatementsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from('test'));
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);
    service = new StatementsService(
      statementRepository as any,
      transactionRepository as any,
      auditLogRepository as any,
      userRepository as any,
      workspaceMemberRepository as any,
      fileStorageService as any,
      statementProcessingService as any,
    );
    jest
      .spyOn(service as any, 'ensureCanEditStatements')
      .mockResolvedValue(undefined);
  });

  it('orders by createdAt when listing statements', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-1', workspaceId: null });
    statementRepository.find.mockResolvedValue([]);

    await service.findAll('user-1', 1, 20);

    expect(statementRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { createdAt: 'DESC' },
        where: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
  });

  it('filters by workspace when user is in workspace', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-1', workspaceId: 'ws-1' });
    statementRepository.find.mockResolvedValue([]);

    await service.findAll('user-1', 1, 20);

    expect(statementRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: { workspaceId: 'ws-1' },
        }),
      }),
    );
  });

  it('creates a new statement even when file hash is duplicated', async () => {
    (calculateFileHash as jest.Mock).mockResolvedValue('same-hash');
    userRepository.findOne.mockResolvedValue({ id: 'user-1', workspaceId: null });
    statementRepository.save
      .mockImplementationOnce(async (entity) => ({ ...entity, id: 'stmt-1' }))
      .mockImplementationOnce(async (entity) => ({ ...entity, id: 'stmt-2' }));
    statementRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'stmt-1' });

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
