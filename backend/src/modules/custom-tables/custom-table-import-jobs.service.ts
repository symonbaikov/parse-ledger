import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomTableImportJob, CustomTableImportJobStatus, CustomTableImportJobType } from '../../entities/custom-table-import-job.entity';

@Injectable()
export class CustomTableImportJobsService {
  private readonly logger = new Logger(CustomTableImportJobsService.name);

  constructor(
    @InjectRepository(CustomTableImportJob)
    private readonly jobRepository: Repository<CustomTableImportJob>,
  ) {}

  async createGoogleSheetsJob(userId: string, payload: Record<string, any>): Promise<CustomTableImportJob> {
    const job = this.jobRepository.create({
      userId,
      type: CustomTableImportJobType.GOOGLE_SHEETS,
      status: CustomTableImportJobStatus.PENDING,
      progress: 0,
      stage: 'queued',
      payload,
      result: null,
      error: null,
    });
    return this.jobRepository.save(job);
  }

  async getJobForUser(userId: string, jobId: string): Promise<CustomTableImportJob> {
    const job = await this.jobRepository.findOne({ where: { id: jobId, userId } });
    if (!job) throw new NotFoundException('Job не найден');
    return job;
  }

  async updateProgress(jobId: string, patch: { progress?: number; stage?: string | null }) {
    const update: any = {};
    if (patch.progress !== undefined) update.progress = patch.progress;
    if (patch.stage !== undefined) update.stage = patch.stage;
    if (!Object.keys(update).length) return;
    try {
      await this.jobRepository.update({ id: jobId }, update);
    } catch (error) {
      this.logger.warn(`Failed to update job progress jobId=${jobId}`);
    }
  }

  async markDone(jobId: string, result: Record<string, any>) {
    await this.jobRepository.update(
      { id: jobId },
      {
        status: CustomTableImportJobStatus.DONE,
        progress: 100,
        stage: 'done',
        result,
        error: null,
        finishedAt: new Date(),
      } as any,
    );
  }

  async markFailed(jobId: string, error: string) {
    await this.jobRepository.update(
      { id: jobId },
      {
        status: CustomTableImportJobStatus.FAILED,
        stage: 'failed',
        error: error?.slice(0, 5000) || 'Unknown error',
        finishedAt: new Date(),
      } as any,
    );
  }
}

