import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from '../../entities/category.entity';
import { User, WorkspaceMember } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User, WorkspaceMember])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}







