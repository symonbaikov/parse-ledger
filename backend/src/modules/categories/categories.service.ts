import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from '../../entities/category.entity';
import { User, WorkspaceMember, WorkspaceRole } from '../../entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  private async ensureCanEditCategories(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'workspaceId'],
    });
    const workspaceId = user?.workspaceId ?? null;
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

  async create(userId: string, createDto: CreateCategoryDto): Promise<Category> {
    await this.ensureCanEditCategories(userId);
    // Check for duplicate name
    const existing = await this.categoryRepository.findOne({
      where: { userId, name: createDto.name, type: createDto.type },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      userId,
      ...createDto,
      isSystem: false,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(userId: string, type?: CategoryType): Promise<Category[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return this.categoryRepository.find({
      where,
      relations: ['children', 'parent'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, userId: string, updateDto: UpdateCategoryDto): Promise<Category> {
    await this.ensureCanEditCategories(userId);
    const category = await this.findOne(id, userId);

    if (category.isSystem) {
      throw new ForbiddenException('Cannot modify system category');
    }

    // Check for duplicate name if name is being changed
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { userId, name: updateDto.name, type: category.type },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.ensureCanEditCategories(userId);
    const category = await this.findOne(id, userId);

    if (category.isSystem) {
      throw new ForbiddenException('Cannot delete system category');
    }

    await this.categoryRepository.remove(category);
  }

  async createSystemCategories(userId: string): Promise<void> {
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
        where: { userId, name: catData.name },
      });

      if (!existing) {
        const category = this.categoryRepository.create({
          userId,
          ...catData,
        });
        await this.categoryRepository.save(category);
      }
    }
  }
}


