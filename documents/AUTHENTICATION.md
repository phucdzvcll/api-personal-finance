# Authentication System Documentation
## Personal Finance Management System (NestJS)

---

## 1. Purpose

This document describes the **authentication and authorization system** of the Personal Finance Management System, including:
- Authentication architecture and flow
- JWT token management
- User registration and login
- Protected routes and guards
- API endpoints and usage

This document serves as a **technical reference** for developers working on authentication features.

---

## 2. Technology Stack

| Technology | Purpose |
|-----------|---------|
| **JWT (JSON Web Tokens)** | Stateless authentication tokens |
| **Passport.js** | Authentication middleware |
| **@nestjs/passport** | NestJS Passport integration |
| **@nestjs/jwt** | JWT module for NestJS |
| **bcrypt** | Password hashing |
| **TypeORM** | User data persistence |

---

## 3. Architecture Overview

The authentication system follows a **JWT-based stateless authentication** pattern:

```
Client → AuthController → AuthService → UsersService → UserRepository → Database
                ↓
         JWT Token Generation
                ↓
         Client receives token
                ↓
         Client uses token in Authorization header
                ↓
         JwtAuthGuard validates token
                ↓
         Protected routes accessible
```

---

## 4. Module Structure

### 4.1 Users Module

**Location:** `src/modules/users/`

**Components:**
- `entities/user.entity.ts` - User database entity
- `repositories/user.repository.ts` - Data access layer
- `users.service.ts` - Business logic for user operations
- `users.module.ts` - Module definition
- `dto/create-user.dto.ts` - User creation DTO
- `dto/user-response.dto.ts` - User response DTO

**Responsibilities:**
- User CRUD operations
- Password hashing and validation
- User data validation

### 4.2 Auth Module

**Location:** `src/modules/auth/`

**Components:**
- `auth.service.ts` - Authentication business logic
- `auth.controller.ts` - Authentication endpoints
- `auth.module.ts` - Module definition
- `strategies/jwt.strategy.ts` - JWT validation strategy
- `guards/jwt-auth.guard.ts` - Route protection guard
- `dto/login.dto.ts` - Login request DTO
- `dto/auth-response.dto.ts` - Authentication response DTO

**Responsibilities:**
- User registration
- User login
- JWT token generation
- Token validation

---

## 5. User Entity

### 5.1 Database Schema

```typescript
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 5.2 Field Descriptions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | Integer (PK) | Unique identifier | Auto-generated |
| `username` | String | Unique username | Unique, required |
| `email` | String | Email address | Unique, required, valid email format |
| `passwordHash` | String | Hashed password | Required, never stored in plain text |
| `createdAt` | DateTime | Account creation timestamp | Auto-generated |

---

## 6. Authentication Flow

### 6.1 Registration Flow

1. **Client sends POST request** to `/api/v1/auth/register` with:
   - `username` (string, 3-50 characters)
   - `email` (valid email format)
   - `password` (string, minimum 8 characters)

2. **AuthController** receives request and validates DTO

3. **AuthService** calls `UsersService.create()`:
   - Checks username uniqueness
   - Checks email uniqueness
   - Hashes password using bcrypt (10 salt rounds)
   - Creates user record

4. **JWT token generated** with payload:
   ```json
   {
     "sub": userId,
     "username": username
   }
   ```

5. **Response returned** with:
   - `accessToken` (JWT string)
   - `user` (user information without password)

### 6.2 Login Flow

1. **Client sends POST request** to `/api/v1/auth/login` with:
   - `usernameOrEmail` (username or email)
   - `password` (plain text password)

2. **AuthService** validates credentials:
   - Finds user by username or email
   - Compares provided password with stored hash
   - Throws `UnauthorizedException` if invalid

3. **JWT token generated** if credentials valid

4. **Response returned** with token and user information

### 6.3 Protected Route Access

1. **Client includes token** in `Authorization` header:
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **JwtAuthGuard** intercepts request:
   - Extracts token from header
   - Validates token signature and expiration
   - Calls `JwtStrategy.validate()` with token payload

3. **JwtStrategy** validates user:
   - Extracts user ID from token payload
   - Fetches user from database
   - Attaches user to request object

4. **Controller** receives authenticated request with user context

---

## 7. API Endpoints

### 7.1 Register User

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `409 Conflict`: Username or email already exists
- `400 Bad Request`: Validation errors

### 7.2 Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "usernameOrEmail": "johndoe",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

### 7.3 Get Profile

**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

## 8. Security Best Practices

### 8.1 Password Security

- **Never store passwords in plain text**
- Use bcrypt with 10 salt rounds for hashing
- Minimum password length: 8 characters
- Passwords are never returned in API responses

### 8.2 JWT Security

- **Token expiration**: Configurable via `JWT_EXPIRES_IN` (default: 7 days)
- **Secret key**: Stored in environment variables, never in code
- **Token validation**: Signature and expiration checked on every request

### 8.3 Input Validation

- All DTOs validated using `class-validator`
- Username: 3-50 characters
- Email: Valid email format
- Password: Minimum 8 characters

### 8.4 Error Handling

- Generic error messages for security (e.g., "Invalid credentials" instead of "User not found")
- No information leakage about existing users

---

## 9. Using Authentication in Controllers

### 9.1 Protecting Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@Controller('transactions')
export class TransactionsController {
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getTransactions(@GetUser() user: UserEntity) {
    // user.id contains the authenticated user's ID
    // Access user.username, user.email, etc.
  }
}
```

### 9.2 Swagger Documentation

Protected endpoints must include:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
```

---

## 10. Configuration

### 10.1 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |

### 10.2 Example Configuration

```env
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

---

## 11. Testing Authentication

### 11.1 Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 11.2 Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "johndoe",
    "password": "SecurePassword123!"
  }'
```

### 11.3 Access Protected Route

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## 12. Future Enhancements

Potential improvements:
- Refresh token mechanism
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub, etc.)
- Role-based access control (RBAC)
- Rate limiting for authentication endpoints

---

## 13. Conclusion

The authentication system provides:
- **Secure** password hashing and JWT token management
- **Stateless** authentication suitable for scalable applications
- **Type-safe** implementation with TypeScript
- **Well-documented** API endpoints with Swagger
- **Extensible** architecture for future enhancements

---
