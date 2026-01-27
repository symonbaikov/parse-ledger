import { GoogleSheetsController } from '@/modules/google-sheets/google-sheets.controller';
import { BadRequestException } from '@nestjs/common';

describe('GoogleSheetsController', () => {
  it('toPublicSheet hides refreshToken and sets oauthConnected flag', async () => {
    const googleSheetsService = {
      getAuthUrl: jest.fn(() => 'https://auth'),
      connectWithOAuthCode: jest.fn(async () => ({
        id: '1',
        sheetId: 'sid',
        sheetName: 'S',
        worksheetName: 'W',
        isActive: true,
        refreshToken: 'real-token',
      })),
      findAll: jest.fn(async () => [
        {
          id: '1',
          refreshToken: 'placeholder-token',
          sheetId: 'sid',
          sheetName: 'S',
          worksheetName: 'W',
          isActive: true,
        },
      ]),
      findOne: jest.fn(async () => ({
        id: '1',
        refreshToken: 'real-token',
        sheetId: 'sid',
        sheetName: 'S',
        worksheetName: 'W',
        isActive: true,
      })),
      syncTransactions: jest.fn(async () => ({
        synced: 1,
        sheet: { lastSync: new Date() },
      })),
      remove: jest.fn(async () => undefined),
    };
    const controller = new GoogleSheetsController(googleSheetsService as any);

    expect(await controller.getAuthUrl('state')).toEqual({
      url: 'https://auth',
    });

    const oauth = await controller.oauthCallback(
      { code: 'c', sheetId: 'sid', worksheetName: 'W', sheetName: 'S' } as any,
      { id: 'u1' } as any,
    );
    expect(oauth.sheet.oauthConnected).toBe(true);

    const all = await controller.findAll({ id: 'u1' } as any);
    expect(all[0].oauthConnected).toBe(false);

    const one = await controller.findOne('1', { id: 'u1' } as any);
    expect(one.oauthConnected).toBe(true);
  });

  it('connect endpoint is deprecated', async () => {
    const controller = new GoogleSheetsController({} as any);
    await expect(controller.connect({} as any, { id: 'u1' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });
});
