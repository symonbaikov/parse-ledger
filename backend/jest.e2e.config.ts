import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  displayName: 'e2e',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  maxWorkers: 1,
  runInBand: true,
};

export default config;
