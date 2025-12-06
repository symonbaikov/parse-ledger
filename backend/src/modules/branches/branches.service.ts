import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(userId: string, createDto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create({
      userId,
      ...createDto,
      isActive: true,
    });

    return this.branchRepository.save(branch);
  }

  async findAll(userId: string): Promise<Branch[]> {
    return this.branchRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, userId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, userId: string, updateDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id, userId);
    Object.assign(branch, updateDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string, userId: string): Promise<void> {
    const branch = await this.findOne(id, userId);
    await this.branchRepository.remove(branch);
  }
}








