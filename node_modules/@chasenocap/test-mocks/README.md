# test-mocks

Mock implementations of common interfaces for testing in the H1B monorepo.

## Installation

```bash
npm install test-mocks --save-dev
```

## Overview

This package provides lightweight, feature-rich mock implementations of common interfaces used throughout the H1B monorepo. Each mock includes built-in assertion helpers and state tracking for easier testing.

## Available Mocks

### MockLogger

A mock implementation of `ILogger` with call tracking and assertion helpers.

```typescript
import { MockLogger } from 'test-mocks';

const logger = new MockLogger();

// Use like a normal logger
logger.info('User logged in', { userId: 123 });
logger.error('Failed to connect', new Error('Connection timeout'));

// Assert on calls
expect(logger.hasLogged('info', 'User logged in')).toBe(true);
expect(logger.getCallsByLevel('error')).toHaveLength(1);

// Clear between tests
logger.clear();
```

### MockFileSystem

An in-memory file system implementation for testing file operations.

```typescript
import { MockFileSystem } from 'test-mocks';

const fs = new MockFileSystem();

// Seed with test files
fs.seed({
  '/src/index.ts': 'export const hello = "world";',
  '/package.json': '{"name": "test"}'
});

// Use like a normal file system
await fs.writeFile('/output.txt', 'test content');
const exists = await fs.exists('/output.txt'); // true

// Inspect state
expect(fs.getFiles()).toContain('/output.txt');

// Clear between tests
fs.clear();
```

### MockCache

A mock cache implementation with statistics tracking.

```typescript
import { MockCache } from 'test-mocks';

const cache = new MockCache<string>();

// Use like a normal cache
await cache.set('key', 'value', 1000); // TTL in ms
const value = await cache.get('key'); // 'value'

// Check statistics
expect(cache.stats.hits).toBe(1);
expect(cache.getHitRate()).toBe(1.0);

// Clear and reset
cache.clear();
cache.resetStats();
```

## Integration with DI

All mocks are decorated with `@injectable()` for use with Inversify:

```typescript
import { Container } from 'inversify';
import { MockLogger } from 'test-mocks';

const container = new Container();
container.bind<ILogger>(TYPES.ILogger).to(MockLogger);
```

## Best Practices

1. **Clear mocks between tests** to ensure test isolation
2. **Use assertion helpers** instead of inspecting internal state
3. **Leverage TypeScript** for type-safe mocking
4. **Keep mocks simple** - they're for testing, not production

## API Reference

See the [TypeScript definitions](./src/index.ts) for complete API documentation.

## License

MIT