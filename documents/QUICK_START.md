# Quick Start Guide - Environment Setup

## Prerequisites

Install the required NestJS config package:

```bash
npm install @nestjs/config
```

## Setup Your Environment

### 1. Choose Your Environment

Copy the appropriate environment template:

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
npm run env:setup dev    # for development
npm run env:setup stg    # for staging
npm run env:setup prod   # for production
```

### 2. Start Database with Docker

```bash
# Development
npm run docker:dev:up

# Staging
npm run docker:stg:up

# Production
npm run docker:prod:up
```

### 3. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Environment Files Overview

| File | Purpose |
|------|---------|
| `env.dev.example` | Development environment template |
| `env.stg.example` | Staging environment template |
| `env.prod.example` | Production environment template |
| `.env` | Your actual environment file (created from templates, gitignored) |

## Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.dev.yml` | Development database |
| `docker-compose.stg.yml` | Staging database |
| `docker-compose.prod.yml` | Production database |

## NPM Scripts

### Docker Management
- `npm run docker:dev:up` - Start development database
- `npm run docker:dev:down` - Stop development database
- `npm run docker:stg:up` - Start staging database
- `npm run docker:stg:down` - Stop staging database
- `npm run docker:prod:up` - Start production database
- `npm run docker:prod:down` - Stop production database

### Environment Setup
- `npm run env:setup [dev|stg|prod]` - Setup environment file from template

## Next Steps

1. Install `@nestjs/config`: `npm install @nestjs/config`
2. Copy environment template: `cp env.dev.example .env`
3. Update `.env` with your values
4. Start database: `npm run docker:dev:up`
5. Start application: `npm run start:dev`

For detailed information, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
