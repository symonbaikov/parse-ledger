import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEntry, DataEntryType } from '../../entities/data-entry.entity';
import { CreateDataEntryDto } from './dto/create-data-entry.dto';

interface ListParams {
  userId: string;
  type?: DataEntryType;
  limit?: number;
}

@Injectable()
export class DataEntryService {
  constructor(
    @InjectRepository(DataEntry)
    private readonly dataEntryRepository: Repository<DataEntry>,
  ) {}

  async create(userId: string, dto: CreateDataEntryDto): Promise<DataEntry> {
    const entry = this.dataEntryRepository.create({
      userId,
      type: dto.type,
      date: dto.date,
      amount: dto.amount,
      note: dto.note || null,
    });
    return this.dataEntryRepository.save(entry);
  }

  async list(params: ListParams): Promise<DataEntry[]> {
    return this.dataEntryRepository.find({
      where: {
        userId: params.userId,
        ...(params.type ? { type: params.type } : {}),
      },
      order: { date: 'DESC', createdAt: 'DESC' },
      take: params.limit ?? 50,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const entry = await this.dataEntryRepository.findOne({ where: { id, userId } });
    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }
    await this.dataEntryRepository.delete(id);
  }
}
