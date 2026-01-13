# Environment Configuration Setup Guide

This project supports three environments: **development (dev)**, **staging (stg)**, and **production (prod)**.

## Quick Start

### 1. Install Required Dependencies

First, install `@nestjs/config` package:

```bash
npm install @nestjs/config
```

### 2. Setup Environment File

Choose your environment and copy the corresponding template:

```bash
# Development (default)
cp env.dev.example .env

# Staging
cp env.stg.example .env

# Production
cp env.prod.example .env
```

Or use the setup script:

```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh dev    # for development
./scripts/setup-env.sh stg    # for staging
./scripts/setup-env.sh prod   # for production
```

### 3. Update Environment Variables

Edit the `.env` file and update the values according to your setup:

- **DB_PASSWORD**: Change default passwords
- **JWT_SECRET**: Use strong, unique secrets
- **DB_HOST**: 
  - `localhost` for local development
  - `postgres` (service name) when using Docker Compose

## Environment Files

| Environment | Template File | Database Name | Port (Default) |
|------------|---------------|---------------|----------------|
| Development | `env.dev.example` | `personal_finance_dev` | 5432 |
| Staging | `env.stg.example` | `personal_finance_stg` | 5433 |
| Production | `env.prod.example` | `personal_finance_prod` | 5434 |

## Docker Compose Usage

### Development
```bash
# Set environment
NODE_ENV=development
cp env.dev.example .env

# Start database
docker-compose -f docker-compose.dev.yml up -d
```

### Staging
```bash
# Set environment
NODE_ENV=staging
cp env.stg.example .env

# Start database
docker-compose -f docker-compose.stg.yml up -d
```

### Production
```bash
# Set environment
NODE_ENV=production
cp env.prod.example .env

# Start database
docker-compose -f docker-compose.prod.yml up -d
```

## Configuration Structure

The configuration is managed through:

1. **Environment Files** (`.env`): Contains environment-specific variables
2. **Config Module** (`src/config/`): NestJS configuration module
3. **Docker Compose**: Environment-specific Docker configurations

## Environment Variables Reference

### Application
- `NODE_ENV`: Environment name (development, staging, production)
- `PORT`: Application port (default: 3000)
- `API_PREFIX`: API prefix (default: api/v1)
- `LOG_LEVEL`: Logging level (debug, info, error)

### Database
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

### JWT
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRES_IN`: JWT expiration time

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` files** to version control (already in `.gitignore`)
2. **Use strong passwords** in production
3. **Use unique JWT secrets** for each environment
4. **Change default values** before deploying to production
5. **Use environment variables** or secrets management in production

## Using Configuration in Code

The configuration is available globally through `@nestjs/config`:

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getDatabaseHost() {
    return this.configService.get<string>('database.host');
  }
}
```

Or using the configuration object:

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {
  const dbConfig = this.configService.get('database');
}
```
