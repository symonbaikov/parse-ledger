import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { DataEntry, DataEntryType } from '../../entities/data-entry.entity';
import { CreateDataEntryDto } from './dto/create-data-entry.dto';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { CreateDataEntryCustomFieldDto } from './dto/create-data-entry-custom-field.dto';
import { UpdateDataEntryCustomFieldDto } from './dto/update-data-entry-custom-field.dto';

interface ListParams {
  userId: string;
  type?: DataEntryType;
  customTabId?: string;
  limit?: number;
}

@Injectable()
export class DataEntryService {
  constructor(
    @InjectRepository(DataEntry)
    private readonly dataEntryRepository: Repository<DataEntry>,
    @InjectRepository(DataEntryCustomField)
    private readonly dataEntryCustomFieldRepository: Repository<DataEntryCustomField>,
  ) {}

  async create(userId: string, dto: CreateDataEntryDto): Promise<DataEntry> {
    const customFieldName = dto.customFieldName?.trim() || null;
    const customFieldValue = dto.customFieldValue?.trim() || null;
    const customFieldIconRaw = dto.customFieldIcon?.trim() || null;
    const customFieldIcon = customFieldName ? customFieldIconRaw : null;
    if (customFieldValue && !customFieldName) {
      throw new BadRequestException('Укажите название пользовательской колонки');
    }

    let customTabId: string | null = null;
    if (dto.customTabId) {
      const customTab = await this.dataEntryCustomFieldRepository.findOne({
        where: { id: dto.customTabId, userId },
      });
      if (!customTab) {
        throw new BadRequestException('Пользовательская вкладка не найдена');
      }
      customTabId = customTab.id;
    }

    const entry = this.dataEntryRepository.create({
      userId,
      type: dto.type,
      date: dto.date,
      amount: dto.amount,
      note: dto.note || null,
      currency: dto.currency || 'KZT',
      customFieldName,
      customFieldIcon,
      customFieldValue,
      customTabId,
    });
    return this.dataEntryRepository.save(entry);
  }

  async list(params: ListParams): Promise<DataEntry[]> {
    if (params.customTabId) {
      return this.dataEntryRepository.find({
        where: {
          userId: params.userId,
          customTabId: params.customTabId,
        },
        order: { date: 'DESC', createdAt: 'DESC' },
        take: params.limit ?? 50,
      });
    }

    return this.dataEntryRepository.find({
      where: {
        userId: params.userId,
        ...(params.type ? { type: params.type } : {}),
        customTabId: IsNull(),
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

  async listCustomFields(userId: string): Promise<Array<DataEntryCustomField & { entriesCount: number }>> {
    const rows = await this.dataEntryCustomFieldRepository
      .createQueryBuilder('f')
      .leftJoin(
        DataEntry,
        'e',
        '"e"."custom_tab_id" = "f"."id" AND "e"."user_id" = "f"."user_id"',
      )
      .where('"f"."user_id" = :userId', { userId })
      .select(['f.id AS id', 'f.name AS name', 'f.icon AS icon'])
      .addSelect('COUNT("e"."id")', 'entriesCount')
      .groupBy('"f"."id"')
      .orderBy('"f"."name"', 'ASC')
      .getRawMany<{ id: string; name: string; icon: string | null; entriesCount: string }>();

    return rows.map((row) => ({
      ...(this.dataEntryCustomFieldRepository.create({
        id: row.id,
        userId,
        name: row.name,
        icon: row.icon,
      }) as any),
      entriesCount: Number(row.entriesCount || 0),
    }));
  }

  async createCustomField(userId: string, dto: CreateDataEntryCustomFieldDto): Promise<DataEntryCustomField> {
    const name = dto.name.trim();
    if (!name.length) {
      throw new BadRequestException('Укажите название колонки');
    }
    const icon = dto.icon?.trim() || null;
    try {
      return await this.dataEntryCustomFieldRepository.save(
        this.dataEntryCustomFieldRepository.create({
          userId,
          name,
          icon,
        }),
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const code = (error as any)?.driverError?.code;
        if (code === '23505') {
          throw new BadRequestException('Колонка с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async updateCustomField(
    userId: string,
    id: string,
    dto: UpdateDataEntryCustomFieldDto,
  ): Promise<DataEntryCustomField> {
    const item = await this.dataEntryCustomFieldRepository.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Колонка не найдена');
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name.length) throw new BadRequestException('Укажите название колонки');
      item.name = name;
    }
    if (dto.icon !== undefined) {
      item.icon = dto.icon === null ? null : (dto.icon?.trim() || null);
    }
    try {
      return await this.dataEntryCustomFieldRepository.save(item);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const code = (error as any)?.driverError?.code;
        if (code === '23505') {
          throw new BadRequestException('Колонка с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async removeCustomField(userId: string, id: string): Promise<void> {
    const item = await this.dataEntryCustomFieldRepository.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Колонка не найдена');
    await this.dataEntryRepository.delete({ userId, customTabId: id });
    await this.dataEntryCustomFieldRepository.delete(id);
  }
}
