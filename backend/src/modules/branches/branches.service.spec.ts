import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from '../../entities/branch.entity';

describe('BranchesService', () => {
  let testingModule: TestingModule;
  let service: BranchesService;
  let branchRepository: Repository<Branch>;

  const mockBranch: Partial<Branch> = {
    id: 'branch-1',
    name: 'Main Office',
    userId: '1',
    isActive: true,
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: getRepositoryToken(Branch),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<BranchesService>(BranchesService);
    branchRepository = testingModule.get<Repository<Branch>>(
      getRepositoryToken(Branch),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testingModule.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'New Branch',
      location: 'Astana',
      description: 'New branch description',
    };

    it('should create a new branch', async () => {
      jest
        .spyOn(branchRepository, 'create')
        .mockReturnValue(mockBranch as Branch);
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      const result = await service.create('1', createDto);

      expect(result).toEqual(mockBranch);
      expect(branchRepository.save).toHaveBeenCalled();
    });

    it('should set isActive to true by default', async () => {
      const createSpy = jest
        .spyOn(branchRepository, 'create')
        .mockReturnValue(mockBranch as Branch);
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      await service.create('1', createDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should associate branch with user', async () => {
      const createSpy = jest
        .spyOn(branchRepository, 'create')
        .mockReturnValue(mockBranch as Branch);
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      await service.create('1', createDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '1',
        }),
      );
    });

    it('should store location information', async () => {
      const createSpy = jest
        .spyOn(branchRepository, 'create')
        .mockReturnValue(mockBranch as Branch);
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      await service.create('1', createDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          location: createDto.location,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all branches for user', async () => {
      const branches = [mockBranch, { ...mockBranch, id: 'branch-2' }];
      jest
        .spyOn(branchRepository, 'find')
        .mockResolvedValue(branches as Branch[]);

      const result = await service.findAll('1');

      expect(result).toHaveLength(2);
      expect(branchRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: '1' },
        }),
      );
    });

    it('should order branches by name', async () => {
      const findSpy = jest
        .spyOn(branchRepository, 'find')
        .mockResolvedValue([mockBranch] as Branch[]);

      await service.findAll('1');

      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });

    it('should return empty array if no branches', async () => {
      jest.spyOn(branchRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll('1');

      expect(result).toEqual([]);
    });

    it('should include inactive branches', async () => {
      const inactiveBranch = { ...mockBranch, isActive: false };
      jest
        .spyOn(branchRepository, 'find')
        .mockResolvedValue([inactiveBranch] as Branch[]);

      const result = await service.findAll('1');

      expect(result.some((b) => !b.isActive)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return branch by id', async () => {
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as Branch);

      const result = await service.findOne('branch-1', '1');

      expect(result).toEqual(mockBranch);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify user ownership', async () => {
      const findOneSpy = jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as Branch);

      await service.findOne('branch-1', '1');

      expect(findOneSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'branch-1', userId: '1' },
        }),
      );
    });

    it('should not return other user branches', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('branch-1', '999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Branch',
      location: 'Shymkent',
    };

    beforeEach(() => {
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as Branch);
    });

    it('should update branch', async () => {
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue({
          ...mockBranch,
          ...updateDto,
        } as Branch);

      const result = await service.update('branch-1', '1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(branchRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if branch not found', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('invalid', '1', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should preserve userId on update', async () => {
      const saveSpy = jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      await service.update('branch-1', '1', updateDto);

      const savedBranch = saveSpy.mock.calls[0][0];
      expect(savedBranch.userId).toBe('1');
    });

    it('should allow partial updates', async () => {
      const partialUpdate = { name: 'New Name Only' };
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue(mockBranch as Branch);

      await service.update('branch-1', '1', partialUpdate);

      expect(branchRepository.save).toHaveBeenCalled();
    });

    it('should allow toggling isActive status', async () => {
      const toggleDto = { isActive: false };
      jest
        .spyOn(branchRepository, 'save')
        .mockResolvedValue({
          ...mockBranch,
          isActive: false,
        } as Branch);

      const result = await service.update('branch-1', '1', toggleDto);

      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as Branch);
    });

    it('should delete branch', async () => {
      const removeSpy = jest
        .spyOn(branchRepository, 'remove')
        .mockResolvedValue(mockBranch as Branch);

      await service.remove('branch-1', '1');

      expect(removeSpy).toHaveBeenCalledWith(mockBranch);
    });

    it('should throw NotFoundException if branch not found', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('invalid', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify user ownership before delete', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('branch-1', '999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle branches with transactions', async () => {
      // Should prevent deletion or cascade
      jest
        .spyOn(branchRepository, 'remove')
        .mockResolvedValue(mockBranch as Branch);

      await service.remove('branch-1', '1');

      expect(branchRepository.remove).toHaveBeenCalled();
    });
  });
});
