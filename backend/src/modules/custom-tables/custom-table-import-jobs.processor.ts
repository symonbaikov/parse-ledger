import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  CustomTableImportJob,
  CustomTableImportJobStatus,
  CustomTableImportJobType,
} from '../../entities/custom-table-import-job.entity';
import { CustomTablesImportService } from './custom-tables-import.service';
import { CustomTableImportJobsService } from './custom-table-import-jobs.service';

@Injectable()
export class CustomTableImportJobsProcessor {
  private readonly logger = new Logger(CustomTableImportJobsProcessor.name);
  private readonly instanceId = process.env.RAILWAY_SERVICE_INSTANCE_ID || process.env.HOSTNAME || uuidv4();
  private running = false;

  constructor(
    @InjectRepository(CustomTableImportJob)
    private readonly jobRepository: Repository<CustomTableImportJob>,
    private readonly importService: CustomTablesImportService,
    private readonly jobsService: CustomTableImportJobsService,
  ) {}

  @Interval(2000)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const job = await this.claimNextJob();
      if (!job) return;
      await this.processJob(job);
    } catch (error) {
      this.logger.warn(`Job tick failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      this.running = false;
    }
  }

  private async claimNextJob(): Promise<CustomTableImportJob | null> {
    const rows = await this.jobRepository.query(
      `
      WITH next_job AS (
        SELECT id
        FROM custom_table_import_jobs
        WHERE status = 'pending' AND type IS NOT NULL
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE custom_table_import_jobs j
      SET status = 'running',
          locked_at = now(),
          locked_by = $1,
          started_at = COALESCE(started_at, now()),
          stage = COALESCE(stage, 'running')
      FROM next_job
      WHERE j.id = next_job.id
      RETURNING
        j.id as id
      `,
      [this.instanceId],
    );
    if (!Array.isArray(rows) || !rows.length) return null;
    const id = (rows[0] as any)?.id as string | undefined;
    if (!id) {
      this.logger.warn(`Claimed job row without id (raw=${JSON.stringify(rows[0])})`);
      return null;
    }
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      this.logger.warn(`Claimed job id=${id} but cannot load it`);
      return null;
    }
    return job;
  }

  private async processJob(job: CustomTableImportJob) {
    this.logger.log(`Processing job ${job.id} type=${job.type}`);
    try {
      if (job.type === CustomTableImportJobType.GOOGLE_SHEETS) {
        const dto = job.payload as any;
        const result = await this.importService.executeGoogleSheetsCommit(job.userId, dto, {
          onProgress: async (progress, stage) => {
            await this.jobsService.updateProgress(job.id, { progress, stage });
          },
        });
        await this.jobsService.markDone(job.id, result);
        return;
      }
      throw new Error(`Unsupported job type: ${job.type}`);
    } catch (error: any) {
      const message = error?.message || String(error);
      this.logger.error(`Job ${job.id} failed: ${message}`);
      await this.jobsService.markFailed(job.id, message);
    } finally {
      await this.jobRepository.update(
        { id: job.id, status: CustomTableImportJobStatus.RUNNING },
        { lockedAt: null, lockedBy: null } as any,
      );
    }
  }
}
