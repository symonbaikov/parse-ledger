import { Semaphore } from '../../../common/utils/semaphore.util';

const DEFAULT_AI_CONCURRENCY = 2;
const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveMs(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const aiSemaphore = new Semaphore(
  parsePositiveInt(process.env.AI_CONCURRENCY, DEFAULT_AI_CONCURRENCY),
);

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

export function isAiCircuitOpen(): boolean {
  const now = Date.now();
  if (circuitOpenUntil && now >= circuitOpenUntil) {
    circuitOpenUntil = 0;
    consecutiveFailures = 0;
  }
  return Boolean(circuitOpenUntil && now < circuitOpenUntil);
}

export function recordAiSuccess() {
  consecutiveFailures = 0;
}

export function recordAiFailure() {
  if (isAiCircuitOpen()) {
    return;
  }

  consecutiveFailures += 1;

  const threshold = parsePositiveInt(
    process.env.AI_CIRCUIT_FAILURE_THRESHOLD,
    DEFAULT_FAILURE_THRESHOLD,
  );

  if (consecutiveFailures >= threshold) {
    const cooldownMs = parsePositiveMs(process.env.AI_CIRCUIT_COOLDOWN_MS, DEFAULT_COOLDOWN_MS);
    circuitOpenUntil = Date.now() + cooldownMs;
    consecutiveFailures = 0;
  }
}

export async function withAiConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  return aiSemaphore.use(fn);
}

