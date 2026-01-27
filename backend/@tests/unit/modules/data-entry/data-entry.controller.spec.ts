import { DataEntryType } from '@/entities/data-entry.entity';
import { DataEntryController } from '@/modules/data-entry/data-entry.controller';
import { BadRequestException } from '@nestjs/common';

describe('DataEntryController', () => {
  it('list clamps limit/page and returns paging metadata', async () => {
    const dataEntryService = {
      create: jest.fn(),
      list: jest.fn(async () => ({ items: [{ id: 'e1' }], total: 1 })),
      remove: jest.fn(),
      listCustomFields: jest.fn(async () => []),
      getHiddenBaseTabs: jest.fn(async () => [DataEntryType.CASH]),
      removeBaseTab: jest.fn(),
      createCustomField: jest.fn(),
      updateCustomField: jest.fn(),
      removeCustomField: jest.fn(),
    };
    const controller = new DataEntryController(dataEntryService as any);

    const result = await controller.list(
      { id: 'u1' } as any,
      DataEntryType.CREDIT,
      undefined,
      9999,
      -10,
      'q',
      '2025-01-01',
    );

    expect(result).toEqual({
      items: [{ id: 'e1' }],
      total: 1,
      page: 1,
      limit: 200,
    });
    expect(dataEntryService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        limit: 200,
        page: 1,
        type: DataEntryType.CREDIT,
      }),
    );
  });

  it('uploadCustomIcon throws when file is missing', async () => {
    const controller = new DataEntryController({} as any);
    await expect(controller.uploadCustomIcon(undefined as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('uploadCustomIcon returns url for uploaded file', async () => {
    const controller = new DataEntryController({} as any);
    const res = await controller.uploadCustomIcon({
      filename: 'icon.png',
    } as any);
    expect(res.url).toBe('/uploads/custom-field-icons/icon.png');
  });
});
