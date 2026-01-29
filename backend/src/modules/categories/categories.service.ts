import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import type { Repository } from 'typeorm';
import { ActorType, AuditAction, EntityType } from '../../entities/audit-event.entity';
import { User, WorkspaceMember, WorkspaceRole } from '../../entities';
import { Category, CategoryType } from '../../entities/category.entity';
import { AuditService } from '../audit/audit.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly auditService: AuditService,
  ) {}

  private async ensureCanEditCategories(workspaceId: string, userId: string): Promise<void> {
    if (!workspaceId) return;

    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
      select: ['role', 'permissions'],
    });

    if (!membership) return;
    if ([WorkspaceRole.ADMIN, WorkspaceRole.OWNER].includes(membership.role)) return;
    if (membership.permissions?.canEditCategories === false) {
      throw new ForbiddenException('Недостаточно прав для редактирования категорий');
    }
  }

  async create(
    workspaceId: string,
    userId: string,
    createDto: CreateCategoryDto,
  ): Promise<Category> {
    await this.ensureCanEditCategories(workspaceId, userId);
    // Check for duplicate name
    const existing = await this.categoryRepository.findOne({
      where: { workspaceId, name: createDto.name, type: createDto.type },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      workspaceId,
      userId,
      ...createDto,
      isSystem: false,
    });

    const saved = await this.categoryRepository.save(category);
    await this.invalidateCache(workspaceId);

    // Audit: track category creation.
    await this.auditService.createEvent({
      workspaceId,
      actorType: ActorType.USER,
      actorId: userId,
      entityType: EntityType.CATEGORY,
      entityId: saved.id,
      action: AuditAction.CREATE,
      diff: { before: null, after: saved },
      meta: {
        parentId: saved.parentId ?? null,
      },
    });
    return saved;
  }

  async findAll(workspaceId: string, type?: CategoryType): Promise<Category[]> {
    const where: any = { workspaceId };
    if (type) {
      where.type = type;
    }

    const cacheKey = `categories:${workspaceId}:${type || 'all'}`;
    const cached = await this.cacheManager.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await this.categoryRepository.find({
      where,
      relations: ['children', 'parent'],
      order: { name: 'ASC' },
    });

    await this.cacheManager.set(cacheKey, categories, 3600000); // 1 hour
    return categories;
  }

  async findOne(id: string, workspaceId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, workspaceId },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    workspaceId: string,
    userId: string,
    updateDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.ensureCanEditCategories(workspaceId, userId);
    const category = await this.findOne(id, workspaceId);
    const before = { ...category };

    if (category.isSystem) {
      throw new ForbiddenException('Cannot modify system category');
    }

    // Check for duplicate name if name is being changed
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { workspaceId, name: updateDto.name, type: category.type },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateDto);
    const saved = await this.categoryRepository.save(category);
    await this.invalidateCache(workspaceId);

    const parentChanged = before.parentId !== saved.parentId;
    // Audit: track category updates with before/after diff.
    await this.auditService.createEvent({
      workspaceId,
      actorType: ActorType.USER,
      actorId: userId,
      entityType: EntityType.CATEGORY,
      entityId: saved.id,
      action: AuditAction.UPDATE,
      diff: { before, after: saved },
      meta: parentChanged
        ? { parentChange: { from: before.parentId ?? null, to: saved.parentId ?? null } }
        : undefined,
      isUndoable: true,
    });
    return saved;
  }

  async remove(id: string, workspaceId: string, userId: string): Promise<void> {
    await this.ensureCanEditCategories(workspaceId, userId);
    const category = await this.findOne(id, workspaceId);

    if (category.isSystem) {
      throw new ForbiddenException('Cannot delete system category');
    }

    await this.categoryRepository.remove(category);
    await this.invalidateCache(workspaceId);

    // Audit: track category deletion for potential rollback.
    await this.auditService.createEvent({
      workspaceId,
      actorType: ActorType.USER,
      actorId: userId,
      entityType: EntityType.CATEGORY,
      entityId: category.id,
      action: AuditAction.DELETE,
      diff: { before: category, after: null },
      meta: {
        parentId: category.parentId ?? null,
      },
      isUndoable: true,
    });
  }

  async createSystemCategories(workspaceId: string, userId?: string): Promise<void> {
    const systemCategories = [
      // Income categories
      { name: 'Приход', type: CategoryType.INCOME, isSystem: true },
      { name: 'Продажи Kaspi', type: CategoryType.INCOME, isSystem: true },
      // Expense categories
      { name: 'Расход', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Зарплаты сотрудникам', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Платежи Kaspi Red', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Аренда', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Коммунальные услуги', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Налоги', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Маркетинг и реклама', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Логистика и доставка', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'IT услуги', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Комиссии банка', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Комиссии Kaspi', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Внутренние переводы', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Кредиты и займы', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Оплата услуг', type: CategoryType.EXPENSE, isSystem: true },
      { name: 'Закупки товаров', type: CategoryType.EXPENSE, isSystem: true },
    ];

    for (const catData of systemCategories) {
      const existing = await this.categoryRepository.findOne({
        where: { workspaceId, name: catData.name },
      });

      if (!existing) {
        const category = this.categoryRepository.create({
          workspaceId,
          userId,
          ...catData,
        });
        await this.categoryRepository.save(category);
      }
    }
    await this.invalidateCache(workspaceId);
  }

  private async invalidateCache(workspaceId: string): Promise<void> {
    await this.cacheManager.del(`categories:${workspaceId}:all`);
    await this.cacheManager.del(`categories:${workspaceId}:${CategoryType.INCOME}`);
    await this.cacheManager.del(`categories:${workspaceId}:${CategoryType.EXPENSE}`);
  }
}
