# Swagger/OpenAPI Setup Guide

This project uses **Swagger/OpenAPI** for API documentation and interactive testing.

## Installation

Install the required package:

```bash
npm install @nestjs/swagger
```

## Accessing Swagger UI

After starting the application, access Swagger UI at:

- **Development/Staging**: `http://localhost:3000/api/v1/docs`
- **Production**: Disabled by default (can be enabled via `SWAGGER_ENABLED=true`)

## Configuration

Swagger is configured through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SWAGGER_ENABLED` | Enable/disable Swagger | `true` (dev/stg), `false` (prod) |
| `SWAGGER_PATH` | Swagger UI path | `docs` |

### Environment-Specific Settings

- **Development**: Swagger enabled by default
- **Staging**: Swagger enabled by default
- **Production**: Swagger disabled by default (security best practice)

## Features

### Authentication

Swagger UI includes JWT Bearer token authentication support. Use the "Authorize" button to add your JWT token for authenticated endpoints.

### API Tags

The API is organized into the following tags:

- `health` - Health check endpoints
- `auth` - Authentication endpoints
- `users` - User management endpoints
- `transactions` - Transaction management endpoints
- `categories` - Category management endpoints
- `debts` - Debt management endpoints
- `credit-cards` - Credit card management endpoints

## Using Swagger Decorators

### Controller Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    // ...
  }
}
```

### DTO Example

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'securePassword123' })
  password: string;
}
```

### Protected Endpoints

For endpoints that require authentication:

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Get('profile')
getProfile() {
  // ...
}
```

## Best Practices

1. **Always document endpoints** using `@ApiOperation`, `@ApiResponse`, and `@ApiTags`
2. **Document DTOs** using `@ApiProperty` decorators
3. **Use appropriate tags** to organize endpoints
4. **Include authentication** decorators for protected endpoints
5. **Provide examples** in API property descriptions
6. **Disable in production** unless specifically needed (security consideration)

## Testing with Swagger

1. Start the application: `npm run start:dev`
2. Navigate to: `http://localhost:3000/api/v1/docs`
3. Explore available endpoints
4. Use "Try it out" to test endpoints
5. Add JWT token via "Authorize" button for protected endpoints

## Customization

To customize Swagger configuration, edit `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Your API Title')
  .setDescription('Your API Description')
  .setVersion('1.0')
  // Add more configuration...
  .build();
```
