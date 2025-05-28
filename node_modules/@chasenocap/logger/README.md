# Logger Package

A reusable logging package for the H1B monorepo using Winston with daily rotation and structured logging.

## Features

- **Winston-based logging** with console and file transports
- **Daily log rotation** with configurable retention
- **Child loggers** with context inheritance
- **Test-friendly** mode that disables file output
- **TypeScript support** with full type definitions
- **Structured logging** with JSON format

## Installation

```bash
npm install logger
```

## Quick Start

```typescript
import { createLogger } from 'logger';

const logger = createLogger('my-service');

logger.info('Application started');
logger.error('Something went wrong', new Error('Details'));
```

## API Reference

### Factory Functions

#### `createLogger(service, context?, config?)`

Creates a production logger with file output.

```typescript
const logger = createLogger('api-service', { version: '1.0.0' });
```

#### `createTestLogger(service?, context?)`

Creates a test logger without file output.

```typescript
const testLogger = createTestLogger('test-service');
```

### Logger Interface

```typescript
interface ILogger {
  debug(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  warn(message: string, context?: ILogContext): void;
  error(message: string, error?: Error, context?: ILogContext): void;
  child(context: ILogContext): ILogger;
}
```

### Configuration

```typescript
interface ILoggerConfig {
  service?: string;     // Service name (default: 'h1b-logger')
  level?: string;       // Log level (default: process.env.LOG_LEVEL || 'info')
  logDir?: string;      // Log directory (default: './logs')
  maxFiles?: string;    // Max file retention (default: '14d')
  maxSize?: string;     // Max file size (default: '10m')
  test?: boolean;       // Test mode - no file output (default: false)
}
```

## Usage Examples

### Basic Logging

```typescript
import { createLogger } from 'logger';

const logger = createLogger('user-service');

logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { limit: 100, current: 95 });
logger.error('Database connection failed', dbError, { attempt: 3 });
```

### Child Loggers

```typescript
const requestLogger = logger.child({ 
  requestId: 'req-123',
  userId: 'user-456' 
});

// All logs will include requestId and userId
requestLogger.info('Processing request');
requestLogger.error('Validation failed');
```

### Custom Configuration

```typescript
import { WinstonLogger } from 'logger';

const customLogger = new WinstonLogger(
  { service: 'api' },
  {
    service: 'custom-api',
    level: 'debug',
    logDir: '/var/logs',
    maxFiles: '30d'
  }
);
```

### Testing

```typescript
import { createTestLogger } from 'logger';

describe('MyService', () => {
  const logger = createTestLogger('test-service');
  
  it('should log operations', () => {
    const service = new MyService(logger);
    // Test without file I/O
  });
});
```

## Environment Variables

- `LOG_LEVEL`: Set the log level (debug, info, warn, error)

## Log Format

Logs are structured as JSON with these fields:

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2023-05-23T10:30:00.000Z",
  "service": "user-service",
  "userId": "123",
  "requestId": "req-456"
}
```

## File Organization

- **Console**: Colorized simple format for development
- **Files**: JSON format in `logs/` directory
- **Rotation**: Daily rotation with configurable retention
- **Naming**: `{service}-YYYY-MM-DD.log`

## Dependencies

- `winston`: Core logging library
- `winston-daily-rotate-file`: File rotation transport
- `inversify`: Dependency injection support (optional)

## Development

```bash
npm run build     # Build the package
npm test          # Run tests
npm run lint      # Lint code
npm run typecheck # Type checking
```
# Instant Update Test 1748277580
