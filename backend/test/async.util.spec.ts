import { retry, sleep, TimeoutError, withTimeout } from '../src/common/utils/async.util';

describe('async.util', () => {
  it('withTimeout returns result when completed on time', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 50);
    expect(result).toBe('ok');
  });

  it('withTimeout throws TimeoutError when timed out', async () => {
    await expect(withTimeout(sleep(50).then(() => 'ok'), 5)).rejects.toBeInstanceOf(TimeoutError);
  });

  it('retry retries until success', async () => {
    let attempts = 0;

    const result = await retry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'ok';
      },
      { retries: 2, baseDelayMs: 1, maxDelayMs: 5, jitter: false },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('retry does not retry when isRetryable returns false', async () => {
    let attempts = 0;

    await expect(
      retry(
        async () => {
          attempts += 1;
          throw new Error('fail');
        },
        { retries: 5, isRetryable: () => false },
      ),
    ).rejects.toThrow('fail');

    expect(attempts).toBe(1);
  });
});

