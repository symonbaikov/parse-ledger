import { sleep } from '@/common/utils/async.util';
import { Semaphore } from '@/common/utils/semaphore.util';

describe('Semaphore', () => {
  it('limits concurrency', async () => {
    const semaphore = new Semaphore(1);
    let active = 0;
    let maxActive = 0;

    const task = async () =>
      semaphore.use(async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await sleep(10);
        active -= 1;
      });

    await Promise.all([task(), task(), task()]);

    expect(maxActive).toBe(1);
  });
});
