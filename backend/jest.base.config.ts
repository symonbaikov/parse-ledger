import type { Config } from 'jest';

const baseConfig: Config = {
  testEnvironment: 'node',
  rootDir: '.',
  cache: true,
  setupFiles: ['reflect-metadata'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { rootMode: 'upward' }],
  },
};

export default baseConfig;
