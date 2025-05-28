# test-helpers

Test utilities and helpers for consistent, maintainable tests across the H1B monorepo.

## Installation

```bash
npm install test-helpers --save-dev
```

## Overview

This package provides a comprehensive set of test utilities to reduce boilerplate and ensure consistent testing patterns across all packages in the H1B monorepo.

## Features

### Test Container Setup

Simplified dependency injection container setup for tests:

```typescript
import { setupTest } from 'test-helpers';

describe('MyService', () => {
  const { container, mocks, cleanup } = setupTest({
    useMocks: ['logger', 'fileSystem']
  });
  
  afterEach(() => cleanup());
  
  it('should log operations', async () => {
    const service = container.get(MyService);
    await service.doWork();
    
    expect(mocks.logger.hasLogged('info', 'Work started')).toBe(true);
  });
});
```

### Fixture Management

Easy test data management:

```typescript
import { FixtureManager } from 'test-helpers';

const fixtures = new FixtureManager(__dirname);

// Load test data
const data = await fixtures.loadJSON('test-data.json');

// Create temp directories
const tempDir = await fixtures.createTempDir();

// Auto cleanup
await fixtures.cleanup();
```

### Async Test Utilities

Powerful async testing helpers:

```typescript
import { waitFor, measureTime, retry } from 'test-helpers';

// Wait for condition
await waitFor(() => service.isReady);

// Measure performance
const { result, duration } = await measureTime(
  () => service.process()
);

// Retry with backoff
const data = await retry(() => fetchData(), 3, 1000);
```

### Shared Vitest Configuration

Consistent test configuration across packages:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sharedTestConfig } from 'test-helpers/config';

export default defineConfig(sharedTestConfig);
```

## Quick Start

### Basic Test Setup

```typescript
import { setupTest, waitFor } from 'test-helpers';
import { MyService } from '../src/MyService';

describe('MyService', () => {
  const setup = setupTest({
    useMocks: ['logger', 'cache']
  });
  
  afterEach(() => setup.cleanup());
  
  it('should cache results', async () => {
    const service = setup.container.get(MyService);
    
    await service.fetchData();
    await service.fetchData(); // Should hit cache
    
    expect(setup.mocks.cache.stats.hits).toBe(1);
  });
});
```

### Parameterized Tests

```typescript
import { testEach } from 'test-helpers';

testEach([
  { name: 'empty string', input: '', expected: 0 },
  { name: 'single word', input: 'hello', expected: 5 },
  { name: 'multiple words', input: 'hello world', expected: 11 }
], ({ input, expected }) => {
  expect(countChars(input)).toBe(expected);
});
```

### Error Testing

```typescript
import { assertThrowsError } from 'test-helpers';

it('should validate input', async () => {
  const error = await assertThrowsError(
    () => service.process(null),
    ValidationError,
    'Input cannot be null'
  );
  
  expect(error.code).toBe('INVALID_INPUT');
});
```

## API Reference

### Container Utilities
- `setupTest(options)` - Create test container with mocks
- `createTestContainer(options)` - Lower-level container creation
- `TestContainerBuilder` - Build custom test containers

### Fixture Management
- `FixtureManager` - Load and manage test fixtures
- `load(path)` - Load text fixture
- `loadJSON(path)` - Load JSON fixture
- `createTempDir()` - Create temporary directory

### Async Utilities
- `waitFor(condition, timeout?, interval?)` - Wait for condition
- `measureTime(fn)` - Measure async operation time
- `retry(fn, attempts?, delay?)` - Retry with backoff
- `delay(ms)` - Promise-based delay

### Setup Helpers
- `withTestContext(options, fn)` - Run test with auto cleanup
- `flushPromises()` - Ensure all promises resolve
- `suppressConsole()` - Capture console output

### Configuration
- `sharedTestConfig` - Base vitest configuration
- `createTestConfig(custom)` - Extend base config
- `testPatterns` - Common test file patterns

## Best Practices

1. **Use `setupTest`** for consistent container setup
2. **Always cleanup** fixtures and test containers
3. **Leverage async utilities** instead of manual timeouts
4. **Share configuration** to maintain consistency

## License

MIT