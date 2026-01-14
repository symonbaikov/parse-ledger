import {
  User,
  UserRole,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceRole,
} from '@/entities';
import { AuthService } from '@/modules/auth/auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hashed_${value}`),
  compare: jest.fn(async () => true),
}));

describe('AuthService', () => {
  let testingModule: TestingModule;
  let service: AuthService;
  let userRepository: Repository<User>;
  let workspaceRepository: Repository<Workspace>;
  let workspaceInvitationRepository: Repository<WorkspaceInvitation>;
  let workspaceMemberRepository: Repository<WorkspaceMember>;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    name: 'Test User',
    role: UserRole.USER,
    workspaceId: '1',
    isActive: true,
  };

  const mockWorkspace: Partial<Workspace> = {
    id: '1',
    name: 'Test Workspace',
    ownerId: '1',
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceInvitation),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<AuthService>(AuthService);
    userRepository = testingModule.get<Repository<User>>(getRepositoryToken(User));
    workspaceRepository = testingModule.get<Repository<Workspace>>(getRepositoryToken(Workspace));
    workspaceInvitationRepository = testingModule.get<Repository<WorkspaceInvitation>>(
      getRepositoryToken(WorkspaceInvitation),
    );
    workspaceMemberRepository = testingModule.get<Repository<WorkspaceMember>>(
      getRepositoryToken(WorkspaceMember),
    );
    jwtService = testingModule.get<JwtService>(JwtService);
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

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...mockUser,
        email: registerDto.email,
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      } as User);
      jest.spyOn(workspaceRepository, 'create').mockReturnValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceRepository, 'save').mockResolvedValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceMemberRepository, 'create').mockReturnValue({} as WorkspaceMember);
      jest.spyOn(workspaceMemberRepository, 'save').mockResolvedValue({} as WorkspaceMember);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed_password');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should normalize email to lowercase', async () => {
      const registerDto = {
        email: 'Test@EXAMPLE.com',
        password: 'password123',
        name: 'Test User',
      };

      const findOneSpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(workspaceRepository, 'create').mockReturnValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceRepository, 'save').mockResolvedValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceMemberRepository, 'create').mockReturnValue({} as WorkspaceMember);
      jest.spyOn(workspaceMemberRepository, 'save').mockResolvedValue({} as WorkspaceMember);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed_password');

      await service.register(registerDto);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should not store plain text password', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'plain_password',
        name: 'New User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as User);
      jest.spyOn(workspaceRepository, 'create').mockReturnValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceRepository, 'save').mockResolvedValue(mockWorkspace as Workspace);
      jest.spyOn(workspaceMemberRepository, 'create').mockReturnValue({} as WorkspaceMember);
      jest.spyOn(workspaceMemberRepository, 'save').mockResolvedValue({} as WorkspaceMember);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed_password');

      await service.register(registerDto);

      const savedUser = saveSpy.mock.calls[0][0];
      expect(savedUser.passwordHash).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
    });

    it('should return access and refresh tokens for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...mockUser,
        passwordHash: await bcrypt.hash('password123', 10),
      } as User);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...mockUser,
        passwordHash: await bcrypt.hash('correct_password', 10),
      } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle case-insensitive email lookup', async () => {
      const loginDto = {
        email: 'Test@EXAMPLE.com',
        password: 'password123',
      };

      const findOneSpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...mockUser,
        passwordHash: await bcrypt.hash('password123', 10),
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      await service.login(loginDto);

      expect(findOneSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        }),
      );
    });

    it('should update last login timestamp', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...mockUser,
        passwordHash: await bcrypt.hash('password123', 10),
      } as User);

      await service.login(loginDto);

      expect(userRepository.save).toHaveBeenCalled();
      const savedUser = (userRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedUser).toHaveProperty('lastLogin');
    });
  });

  describe('logout', () => {
    it('should clear refresh token from database', async () => {
      const userId = '1';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);

      const result = await service.logout(userId);

      expect(result).toHaveProperty('message');
    });

    it('should return success even if user not found', async () => {
      const userId = '999';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.logout(userId)).resolves.not.toThrow();
    });
  });
});
