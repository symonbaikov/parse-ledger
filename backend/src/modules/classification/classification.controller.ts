import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Transaction } from '../../entities/transaction.entity';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClassificationService } from './services/classification.service';

@Controller('classification')
@UseGuards(JwtAuthGuard)
export class ClassificationController {
  constructor(
    private classificationService: ClassificationService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  @Post('transaction/:id')
  @HttpCode(HttpStatus.OK)
  async classifyTransaction(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const classification = await this.classificationService.classifyTransaction(
      transaction,
      user.id,
    );

    Object.assign(transaction, classification);
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async classifyBulk(@Body() body: { transactionIds: string[] }, @CurrentUser() user: User) {
    const { transactionIds } = body;

    for (const transactionId of transactionIds) {
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });

      if (transaction) {
        const classification = await this.classificationService.classifyTransaction(
          transaction,
          user.id,
        );
        Object.assign(transaction, classification);
        await this.transactionRepository.save(transaction);
      }
    }

    return { message: `Classified ${transactionIds.length} transactions` };
  }
}
