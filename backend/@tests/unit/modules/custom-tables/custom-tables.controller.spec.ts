import { CustomTablesController } from '@/modules/custom-tables/custom-tables.controller';
import { BadRequestException } from '@nestjs/common';

describe('CustomTablesController', () => {
  it('commitGoogleSheets returns jobId', async () => {
    const customTablesService = {
      createTable: jest.fn(),
      listTables: jest.fn(),
    };
    const customTablesImportService = { previewGoogleSheets: jest.fn() };
    const importJobsService = {
      createGoogleSheetsJob: jest.fn(async () => ({ id: 'job-1' })),
    };
    const controller = new CustomTablesController(
      customTablesService as any,
      customTablesImportService as any,
      importJobsService as any,
    );

    const result = await controller.commitGoogleSheets({ id: 'u1' } as any, { any: true } as any);
    expect(result).toEqual({ jobId: 'job-1' });
  });

  it('listRows rejects invalid filters JSON', async () => {
    const controller = new CustomTablesController(
      { listRows: jest.fn() } as any,
      {} as any,
      {} as any,
    );

    await expect(
      controller.listRows({ id: 'u1' } as any, 't1', undefined, 10, '{bad'),
    ).rejects.toThrow(BadRequestException);
  });
});
