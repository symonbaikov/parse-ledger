import { AuthController } from '@/modules/auth/auth.controller';

describe('AuthController', () => {
  it('proxies register/login/logout operations', async () => {
    const authService = {
      register: jest.fn(async () => ({ access_token: 'a', refresh_token: 'r' })),
      login: jest.fn(async () => ({ access_token: 'a', refresh_token: 'r' })),
      refreshToken: jest.fn(async () => ({ access_token: 'new' })),
      logout: jest.fn(async () => ({ message: 'ok' })),
      logoutAll: jest.fn(async () => ({ message: 'ok-all' })),
    };
    const controller = new AuthController(authService as any);

    await expect(controller.register({ email: 'a@b.com' } as any)).resolves.toMatchObject({
      access_token: 'a',
    });
    await expect(
      controller.login({ email: 'a@b.com', password: 'x' } as any),
    ).resolves.toMatchObject({
      refresh_token: 'r',
    });
    await expect(
      controller.refresh({ headers: { authorization: 'Bearer token' } } as any),
    ).resolves.toEqual({ access_token: 'new' });
    await expect(controller.logout({ id: 'u1' } as any)).resolves.toEqual({ message: 'ok' });
    await expect(controller.logoutAll({ id: 'u1' } as any)).resolves.toEqual({ message: 'ok-all' });
    await expect(controller.getProfile({ id: 'u1', email: 'a@b.com' } as any)).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
    });
  });
});
