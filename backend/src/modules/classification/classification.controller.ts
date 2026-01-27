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
    const results = {
      total: transactionIds.length,
      successful: 0,
      failed: 0,
      notFound: 0,
      errors: [] as { transactionId: string; error: string }[],
    };

    for (const transactionId of transactionIds) {
      try {
        const transaction = await this.transactionRepository.findOne({
          where: { id: transactionId },
        });

        if (!transaction) {
          results.notFound++;
          results.errors.push({
            transactionId,
            error: 'Transaction not found',
          });
          continue;
        }

        const classification = await this.classificationService.classifyTransaction(
          transaction,
          user.id,
        );

        // Check if categoryId was actually assigned
        if (!classification.categoryId) {
          results.failed++;
          results.errors.push({
            transactionId,
            error: 'Could not determine category - no matching rules or patterns found',
          });
          continue;
        }

        Object.assign(transaction, classification);
        await this.transactionRepository.save(transaction);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          transactionId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  @Post('learn')
  @HttpCode(HttpStatus.OK)
  async recordLearning(
    @Body() body: { transactionId: string; categoryId: string },
    @CurrentUser() user: User,
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: body.transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await this.classificationService.learnFromCorrection(transaction, body.categoryId, user.id);

    return { message: 'Learning recorded successfully' };
  }
}
