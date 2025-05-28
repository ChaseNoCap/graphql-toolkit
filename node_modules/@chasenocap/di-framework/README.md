# di-framework

Dependency injection utilities and base interfaces for the H1B monorepo.

## Overview

This package provides a thin wrapper around Inversify with additional utilities for:
- Type-safe token creation
- Common interfaces (IResult, IDisposable, IInitializable)
- Container building helpers
- Testing utilities
- Base error classes
- Custom decorators

## Installation

```bash
npm install di-framework
```

## Usage

### Creating Tokens

```typescript
import { createToken, createTokens } from 'di-framework';

// Single token
const ILogger = createToken<ILogger>('ILogger', 'Logging service');

// Multiple tokens
const TOKENS = createTokens('app', {
  IDatabase: 'Database connection service',
  ICache: 'Caching service',
  IMailer: 'Email service',
});
```

### Building Containers

```typescript
import { ContainerBuilder } from 'di-framework';

const builder = new ContainerBuilder()
  .addBinding(TOKENS.ILogger, ConsoleLogger)
  .addBinding(TOKENS.IDatabase, PostgresDatabase)
  .addFactory(TOKENS.ICache, (context) => {
    return () => new RedisCache(context.container.get(TOKENS.ILogger));
  });

const container = await builder.build();
```

### Using Result Pattern

```typescript
import { IResult, success, failure } from 'di-framework';

async function processData(data: string): Promise<IResult<ProcessedData>> {
  try {
    const result = await process(data);
    return success(result, 'Data processed successfully');
  } catch (error) {
    return failure(error as Error);
  }
}
```

### Testing with Mocks

```typescript
import { TestContainerBuilder } from 'di-framework';

describe('MyService', () => {
  let builder: TestContainerBuilder;

  beforeEach(() => {
    builder = TestContainerBuilder.createIsolated()
      .mock(TOKENS.ILogger, new MockLogger())
      .mock(TOKENS.IDatabase, new MockDatabase());
  });

  afterEach(() => {
    builder.reset();
  });

  it('should process data', async () => {
    const container = await builder.build();
    const service = container.get(MyService);
    // ... test logic
  });
});
```

### Using Decorators

```typescript
import { singleton, inject } from 'di-framework';

@singleton
export class UserService {
  constructor(
    @inject(TOKENS.IDatabase) private db: IDatabase,
    @inject(TOKENS.ILogger) private logger: ILogger
  ) {}
}
```

### Lifecycle Interfaces

```typescript
import { IInitializable, IDisposable } from 'di-framework';

@singleton
export class DatabaseConnection implements IInitializable, IDisposable {
  async initialize(): Promise<void> {
    await this.connect();
  }

  async dispose(): Promise<void> {
    await this.disconnect();
  }
}
```

## API Reference

### Interfaces
- `IResult<T>` - Success/failure result pattern
- `IDisposable` - Resource cleanup interface
- `IInitializable` - Service initialization interface
- `IOptions` - Base configuration interface
- `IConfigurable<T>` - Configuration interface

### Container Utilities
- `ContainerBuilder` - Fluent container configuration
- `ContainerModule` - Module with metadata
- `TestContainerBuilder` - Testing-specific builder

### Token Utilities
- `createToken()` - Create type-safe tokens
- `createTokens()` - Create multiple tokens
- `TokenRegistry` - Token metadata tracking

### Decorators
- `@singleton` - Singleton scope
- `@transient` - Transient scope
- `@scoped` - Request scope
- `@inject` - Property/parameter injection
- `@optional` - Optional injection
- `@lazy` - Lazy injection

### Error Classes
- `BaseError` - Base error with context
- `InjectionError` - DI-related errors
- `ServiceNotFoundError` - Missing service
- `CircularDependencyError` - Circular deps
- `ConfigurationError` - Config errors
- `InitializationError` - Init errors

## License

MIT