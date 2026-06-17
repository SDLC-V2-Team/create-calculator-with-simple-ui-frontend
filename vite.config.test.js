import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';

let config;

beforeAll(async () => {
  const configModule = await import('./vite.config.js');
  config = configModule.default;
});

describe('vite.config.js', () => {
  test('happy path: config object is defined and is an object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config).not.toBeNull();
  });

  test('happy path: build.outDir is set to "dist"', () => {
    expect(config.build).toBeDefined();
    expect(config.build.outDir).toBe('dist');
  });

  test('happy path: build.emptyOutDir is set to true', () => {
    expect(config.build).toBeDefined();
    expect(config.build.emptyOutDir).toBe(true);
  });

  test('happy path: test environment is "node"', () => {
    expect(config.test).toBeDefined();
    expect(config.test.environment).toBe('node');
  });

  test('edge case: test.include contains the expected glob pattern', () => {
    expect(config.test).toBeDefined();
    expect(Array.isArray(config.test.include)).toBe(true);
    expect(config.test.include).toContain('tests/**/*.test.js');
  });
});