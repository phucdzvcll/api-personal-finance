# Authentication Setup Guide

## Required Packages

Install the following packages for authentication:

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

Additionally, if using TypeORM (as per TYPEORM_ARCHITECTURE.md):

```bash
npm install @nestjs/typeorm typeorm pg
npm install -D @types/pg
```

And for validation:

```bash
npm install class-validator class-transformer
```

## Database Setup

The authentication system requires a `users` table. Create a TypeORM migration or use the following SQL:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

## Environment Variables

Ensure your `.env` file includes:

```env
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

## TypeORM Configuration

Add TypeORM configuration to your `app.module.ts` or create a database module. The configuration should connect to PostgreSQL using the database settings from your config.

## Testing the Authentication

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "usernameOrEmail": "testuser",
       "password": "password123"
     }'
   ```

3. **Access protected route:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/auth/profile \
     -H "Authorization: Bearer <your_jwt_token>"
   ```

## Swagger Documentation

Access the Swagger UI at: `http://localhost:3000/api/v1/docs`

The authentication endpoints are documented under the `auth` tag. Use the "Authorize" button to add your JWT token for testing protected endpoints.

## File Structure Created

```
src/
├── modules/
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── repositories/
│   │   │   └── user.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   └── auth/
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       ├── dto/
│       │   ├── login.dto.ts
│       │   └── auth-response.dto.ts
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       └── auth.module.ts
└── common/
    └── decorators/
        └── get-user.decorator.ts
```

## Next Steps

1. Install required packages
2. Set up TypeORM database connection
3. Run database migrations
4. Test authentication endpoints
5. Integrate authentication guards in other modules

For detailed information, see [AUTHENTICATION.md](./AUTHENTICATION.md)
