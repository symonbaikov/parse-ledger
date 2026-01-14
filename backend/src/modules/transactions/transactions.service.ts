import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Statement } from '../../entities/statement.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { BulkUpdateItemDto } from './dto/bulk-update-transaction.dto';
import { User } from '../../entities/user.entity';
import { WorkspaceMember, WorkspaceRole } from '../../entities/workspace-member.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Statement)
    private statementRepository: Repository<Statement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  private async ensureCanEditStatements(userId: string): Promise<void> {
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

    if (membership.permissions?.canEditStatements === false) {
      throw new ForbiddenException('Недостаточно прав для редактирования выписок');
    }
  }

  async findAll(
    userId: string,
    filters: {
      statementId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      type?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .where('statement.userId = :userId', { userId })
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.branch', 'branch')
      .leftJoinAndSelect('transaction.wallet', 'wallet');

    if (filters.statementId) {
      query.andWhere('transaction.statementId = :statementId', {
        statementId: filters.statementId,
      });
    }

    if (filters.dateFrom) {
      query.andWhere('transaction.transactionDate >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      query.andWhere('transaction.transactionDate <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    if (filters.type) {
      query.andWhere('transaction.transactionType = :type', { type: filters.type });
    }

    if (filters.categoryId) {
      query.andWhere('transaction.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    query.orderBy('transaction.transactionDate', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['statement', 'category', 'branch', 'wallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const ownerId = (transaction as any).statement?.userId;
    if (ownerId && ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    await this.ensureCanEditStatements(userId);
    const transaction = await this.findOne(id, userId);

    // Recalculate amount if debit/credit changed
    if (updateDto.debit !== undefined || updateDto.credit !== undefined) {
      const debit = updateDto.debit !== undefined ? updateDto.debit : transaction.debit;
      const credit = updateDto.credit !== undefined ? updateDto.credit : transaction.credit;
      updateDto['amount'] = debit || credit || 0;

      // Update transaction type
      if (debit && debit > 0) {
        updateDto['transactionType'] = 'expense' as any;
      } else if (credit && credit > 0) {
        updateDto['transactionType'] = 'income' as any;
      }
    } else if (
      updateDto.amountForeign !== undefined &&
      updateDto.exchangeRate !== undefined &&
      updateDto.amount === undefined
    ) {
      const nativeAmount = Number(updateDto.amountForeign) * Number(updateDto.exchangeRate);
      updateDto['amount'] = nativeAmount;
    }

    Object.assign(transaction, updateDto);
    return this.transactionRepository.save(transaction);
  }

  async bulkUpdate(
    userId: string,
    items: BulkUpdateItemDto[],
  ): Promise<Transaction[]> {
    await this.ensureCanEditStatements(userId);
    const updatedTransactions: Transaction[] = [];

    for (const item of items) {
      try {
        const transaction = await this.update(item.id, userId, item.updates);
        updatedTransactions.push(transaction);
      } catch (error) {
        console.error(`Error updating transaction ${item.id}:`, error);
      }
    }

    return updatedTransactions;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.ensureCanEditStatements(userId);
    const transaction = await this.findOne(id, userId);
    // Use delete for simplicity; entity already validated for ownership.
    await this.transactionRepository.delete(transaction.id);
  }
}






