import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  displayName: 'unit',
  maxWorkers: '50%',
  testMatch: ['<rootDir>/@tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/@tests/e2e/.*\\.e2e-spec\\.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/data-source.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
